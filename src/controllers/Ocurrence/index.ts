import { Request, Response } from "express";
import Ocurrence from "../../models/Ocurrence";
import PoliceStation from "../../models/PoliceStation";
import User from "../../models/User";
import { createNotification } from "../../utils/notifications";
import { emitOcurrence } from "../../services/websocket";

interface IOcurrenceCreateDTO {
    title?: string,
    description?: string,
    type?: string,
    latitude: number,
    longitude: number,
    date?: string,
    time?: string,
    policeStation_id?: string,
}

interface ErrorResponse {
    status: number;
    message: string;
    details?: any;
}

const handleError = (error: any): ErrorResponse => {
    if (error?.code === 'P2002') {
        return {
            status: 409,
            message: "Conflito: Registro duplicado",
            details: error.meta?.target
        };
    }
    if (error?.code === 'P2025') {
        return {
            status: 404,
            message: "Registro não encontrado",
            details: error.meta?.cause
        };
    }
    if (error?.code === 'P2003') {
        return {
            status: 400,
            message: "Violação de restrição de chave estrangeira",
            details: error.meta?.field_name
        };
    }
    return {
        status: 500,
        message: "Erro interno do servidor",
        details: error
    };
};

const validateCoordinates = (latitude: number, longitude: number): string | null => {
    if (isNaN(latitude) || isNaN(longitude)) {
        return "Latitude e longitude devem ser números válidos";
    }
    if (latitude < -90 || latitude > 90) {
        return "Latitude deve estar entre -90 e 90";
    }
    if (longitude < -180 || longitude > 180) {
        return "Longitude deve estar entre -180 e 180";
    }
    return null;
};

const createOcurrence = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, title, description, type, date, time, policeStation_id } = req.body;

        // Validar campos obrigatórios
        if (!latitude || !longitude) {
            return res.status(400).json({
                status: "error",
                message: "Latitude e longitude são obrigatórios",
                code: "MISSING_COORDINATES"
            });
        }

        // Validar coordenadas
        const coordError = validateCoordinates(Number(latitude), Number(longitude));
        if (coordError) {
            return res.status(400).json({
                status: "error",
                message: coordError,
                code: "INVALID_COORDINATES"
            });
        }

        const ocurrenceData: any = {
            latitude: Number(latitude),
            longitude: Number(longitude),
            user_id: req.userId,
        };

        // Validar e adicionar campos opcionais
        if (title) {
            if (typeof title !== 'string' || title.length > 255) {
                return res.status(400).json({
                    status: "error",
                    message: "Título inválido: deve ser uma string com no máximo 255 caracteres",
                    code: "INVALID_TITLE"
                });
            }
            ocurrenceData.title = title;
        }

        if (description) {
            if (typeof description !== 'string') {
                return res.status(400).json({
                    status: "error",
                    message: "Descrição inválida: deve ser uma string",
                    code: "INVALID_DESCRIPTION"
                });
            }
            ocurrenceData.description = description;
        }

        if (type) {
            if (typeof type !== 'string' || !['ROUBO', 'FURTO', 'HOMICIDIO', 'OUTROS'].includes(type.toUpperCase())) {
                return res.status(400).json({
                    status: "error",
                    message: "Tipo inválido: deve ser ROUBO, FURTO, HOMICIDIO ou OUTROS",
                    code: "INVALID_TYPE"
                });
            }
            ocurrenceData.type = type.toUpperCase();
        }

        if (date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                return res.status(400).json({
                    status: "error",
                    message: "Data inválida: use o formato YYYY-MM-DD",
                    code: "INVALID_DATE"
                });
            }
            ocurrenceData.date = date;
        }

        if (time) {
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
            if (!timeRegex.test(time)) {
                return res.status(400).json({
                    status: "error",
                    message: "Hora inválida: use o formato HH:MM:SS",
                    code: "INVALID_TIME"
                });
            }
            ocurrenceData.time = time;
        }

        // Verificar usuário
        const userExist = await User.findUnique({
            where: { id: req.userId }
        });

        if (!userExist) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado",
                code: "USER_NOT_FOUND"
            });
        }

        // Verificar delegacia se fornecida
        if (policeStation_id) {
            const policeStation = await PoliceStation.findUnique({
                where: { id: policeStation_id }
            });

            if (!policeStation) {
                return res.status(404).json({
                    status: "error",
                    message: "Delegacia não encontrada",
                    code: "POLICE_STATION_NOT_FOUND"
                });
            }
            ocurrenceData.policeStation_id = policeStation_id;
        }

        const ocurrenceResponse = await Ocurrence.create({
            data: ocurrenceData,
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                latitude: true,
                longitude: true,
                date: true,
                time: true,
                resolved: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                },
                PoliceStation: {
                    select: {
                        name: true,
                        phone: true,
                    }
                }
            }
        });

        // Emitir evento de nova ocorrência
        emitOcurrence({
            id: ocurrenceResponse.id,
            title: ocurrenceResponse.title || "Sem título",
            description: ocurrenceResponse.description,
            type: ocurrenceResponse.type || "Não especificado",
            latitude: ocurrenceResponse.latitude,
            longitude: ocurrenceResponse.longitude,
            date: ocurrenceResponse.date,
            time: ocurrenceResponse.time,
            user: ocurrenceResponse.User,
            policeStation: ocurrenceResponse.PoliceStation
        });

        // Após criar a ocorrência, cria uma notificação
        if (req.userId) {
            createNotification(
                req.userId,
                "Nova Ocorrência",
                `Nova ocorrência registrada em: ${latitude}, ${longitude}`
            );
        }

        return res.status(201).json({
            status: "success",
            message: "Ocorrência criada com sucesso",
            data: ocurrenceResponse
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const createQuickOcurrence = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude } = req.body;

        // Validar campos obrigatórios
        if (!latitude || !longitude) {
            return res.status(400).json({
                status: "error",
                message: "Latitude e longitude são obrigatórios",
                code: "MISSING_COORDINATES"
            });
        }

        // Validar coordenadas
        const coordError = validateCoordinates(Number(latitude), Number(longitude));
        if (coordError) {
            return res.status(400).json({
                status: "error",
                message: coordError,
                code: "INVALID_COORDINATES"
            });
        }

        // Verificar usuário
        const userExist = await User.findUnique({
            where: { id: req.userId }
        });

        if (!userExist) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado",
                code: "USER_NOT_FOUND"
            });
        }

        const ocurrenceResponse = await Ocurrence.create({
            data: {
                latitude: Number(latitude),
                longitude: Number(longitude),
                user_id: req.userId,
                type: "Não especificado",
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().split(' ')[0]
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });

        // Emitir evento de nova ocorrência rápida
        emitOcurrence({
            id: ocurrenceResponse.id,
            title: "Ocorrência Rápida",
            type: "Não especificado",
            latitude: Number(latitude),
            longitude: Number(longitude),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            user: ocurrenceResponse.User
        });

        // Criar notificação para ocorrência rápida
        if (req.userId) {
            createNotification(
                req.userId,
                "Nova Ocorrência Rápida",
                `Nova ocorrência rápida registrada em: ${latitude}, ${longitude}`
            );
        }

        return res.status(201).json({
            status: "success",
            message: "Ocorrência rápida criada com sucesso",
            data: ocurrenceResponse
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const findAll = async (req: Request, res: Response) => {
    try {
        const allOcurrences = await Ocurrence.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                latitude: true,
                longitude: true,
                date: true,
                time: true,
                resolved: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                },
                PoliceStation: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                },
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Ocorrências listadas com sucesso",
            data: allOcurrences
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const findAllSelf = async (req: Request, res: Response) => {
    try {
        const allOcurrences = await Ocurrence.findMany({
            where: {
                user_id: req.userId
            },
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                latitude: true,
                longitude: true,
                date: true,
                time: true,
                resolved: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                },
                PoliceStation: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    }
                },
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Suas ocorrências foram listadas com sucesso",
            data: allOcurrences
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const ocurrenceCount = async (req: Request, res: Response) => {
    try {
        const count = await Ocurrence.count();

        return res.status(200).json({
            status: "success",
            message: "Contagem de ocorrências realizada com sucesso",
            data: { count }
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const ocurrenceCountSelf = async (req: Request, res: Response) => {
    try {
        const count = await Ocurrence.count({
            where: {
                user_id: req.userId
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Contagem das suas ocorrências realizada com sucesso",
            data: { count }
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const murderCount = async (req: Request, res: Response) => {
    try {
        const count = await Ocurrence.count({
            where: {
                type: 'HOMICIDIO'
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Contagem de homicídios realizada com sucesso",
            data: { count }
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const theftCount = async (req: Request, res: Response) => {
    try {
        const count = await Ocurrence.count({
            where: {
                type: 'FURTO'
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Contagem de furtos realizada com sucesso",
            data: { count }
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const findById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "ID da ocorrência é obrigatório",
                code: "MISSING_ID"
            });
        }

        const ocurrence = await Ocurrence.findFirst({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                latitude: true,
                longitude: true,
                date: true,
                time: true,
                resolved: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                },
                PoliceStation: {
                    select: {
                        name: true,
                        phone: true,
                    }
                },
            }
        });

        if (!ocurrence) {
            return res.status(404).json({
                status: "error",
                message: "Ocorrência não encontrada",
                code: "OCCURRENCE_NOT_FOUND"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Ocorrência encontrada com sucesso",
            data: ocurrence
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, title, description, type, date, time, policeStation_id } = req.body;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "ID da ocorrência é obrigatório",
                code: "MISSING_ID"
            });
        }

        // Verificar se a ocorrência existe
        const existingOcurrence = await Ocurrence.findUnique({
            where: { id }
        });

        if (!existingOcurrence) {
            return res.status(404).json({
                status: "error",
                message: "Ocorrência não encontrada",
                code: "OCCURRENCE_NOT_FOUND"
            });
        }

        // Validar campos obrigatórios
        if (!latitude || !longitude) {
            return res.status(400).json({
                status: "error",
                message: "Latitude e longitude são obrigatórios",
                code: "MISSING_COORDINATES"
            });
        }

        // Validar coordenadas
        const coordError = validateCoordinates(Number(latitude), Number(longitude));
        if (coordError) {
            return res.status(400).json({
                status: "error",
                message: coordError,
                code: "INVALID_COORDINATES"
            });
        }

        const updateData: any = {
            latitude: Number(latitude),
            longitude: Number(longitude),
        };

        // Validar e adicionar campos opcionais
        if (title !== undefined) {
            if (typeof title !== 'string' || title.length > 255) {
                return res.status(400).json({
                    status: "error",
                    message: "Título inválido: deve ser uma string com no máximo 255 caracteres",
                    code: "INVALID_TITLE"
                });
            }
            updateData.title = title;
        }

        if (description !== undefined) {
            if (typeof description !== 'string') {
                return res.status(400).json({
                    status: "error",
                    message: "Descrição inválida: deve ser uma string",
                    code: "INVALID_DESCRIPTION"
                });
            }
            updateData.description = description;
        }

        if (type !== undefined) {
            if (typeof type !== 'string' || !['ROUBO', 'FURTO', 'HOMICIDIO', 'OUTROS'].includes(type.toUpperCase())) {
                return res.status(400).json({
                    status: "error",
                    message: "Tipo inválido: deve ser ROUBO, FURTO, HOMICIDIO ou OUTROS",
                    code: "INVALID_TYPE"
                });
            }
            updateData.type = type.toUpperCase();
        }

        if (date !== undefined) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                return res.status(400).json({
                    status: "error",
                    message: "Data inválida: use o formato YYYY-MM-DD",
                    code: "INVALID_DATE"
                });
            }
            updateData.date = date;
        }

        if (time !== undefined) {
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
            if (!timeRegex.test(time)) {
                return res.status(400).json({
                    status: "error",
                    message: "Hora inválida: use o formato HH:MM:SS",
                    code: "INVALID_TIME"
                });
            }
            updateData.time = time;
        }

        // Verificar delegacia se fornecida
        if (policeStation_id !== undefined) {
            if (policeStation_id) {
                const policeStation = await PoliceStation.findUnique({
                    where: { id: policeStation_id }
                });

                if (!policeStation) {
                    return res.status(404).json({
                        status: "error",
                        message: "Delegacia não encontrada",
                        code: "POLICE_STATION_NOT_FOUND"
                    });
                }
                updateData.policeStation_id = policeStation_id;
            } else {
                updateData.policeStation_id = null;
            }
        }

        const updatedOcurrence = await Ocurrence.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                latitude: true,
                longitude: true,
                date: true,
                time: true,
                resolved: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                },
                PoliceStation: {
                    select: {
                        name: true,
                        phone: true,
                    }
                }
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Ocorrência atualizada com sucesso",
            data: updatedOcurrence
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "ID da ocorrência é obrigatório",
                code: "MISSING_ID"
            });
        }

        // Verificar permissões do usuário
        const user = await User.findFirst({
            where: { id: req.userId },
            select: {
                Permission: {
                    select: { role: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado",
                code: "USER_NOT_FOUND"
            });
        }

        // Definir condições de exclusão baseadas na permissão
        const deleteConditions = user.Permission.role === 'admin'
            ? { id }
            : { id, user_id: req.userId };

        const deletedOcurrence = await Ocurrence.delete({
            where: deleteConditions
        });

        if (!deletedOcurrence) {
            return res.status(404).json({
                status: "error",
                message: "Ocorrência não encontrada ou você não tem permissão para excluí-la",
                code: "OCCURRENCE_NOT_FOUND_OR_UNAUTHORIZED"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Ocorrência excluída com sucesso"
        });

    } catch (error) {
        console.error("Erro detalhado:", error);
        const errorResponse = handleError(error);
        return res.status(errorResponse.status).json({
            status: "error",
            message: errorResponse.message,
            details: errorResponse.details
        });
    }
}

export default {
    createOcurrence,
    createQuickOcurrence,
    findAll,
    findAllSelf,
    ocurrenceCount,
    ocurrenceCountSelf,
    murderCount,
    theftCount,
    findById,
    update,
    remove,
};