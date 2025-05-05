import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { OcurrenceStatus } from "@prisma/client";
import fs from "fs";
import path from "path";
import logger from "../../utils/logger";
import Ocurrence from "../../models/Ocurrence";
import PoliceStation from "../../models/PoliceStation";
import User from "../../models/User";
import { createNotification } from "../../utils/notifications";
import { emitOcurrence } from "../../services/socket";
import { Prisma } from "@prisma/client";

interface IOcurrenceCreateDTO {
    title?: string,
    description?: string,
    type?: string,
    latitude: number,
    longitude: number,
    date?: string,
    time?: string,
    policeStation_id?: string,
    photos?: string[]
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

// Extend Request type to include user and files
declare module "express" {
  interface Request {
    user?: {
      id: string;
    };
    files?: Express.Multer.File[];
  }
}

const createOcurrence = async (req: Request, res: Response) => {
    try {
        console.log('Request received:', {
            body: req.body,
            files: req.files,
            headers: req.headers
        });

        const { latitude, longitude, title, description, type, date, time, police_station_id } = req.body;
        const user_id = req.userId;

        if (!user_id) {
            console.log('User not authenticated');
            // Remove uploaded files if they exist
            if (req.files && Array.isArray(req.files)) {
                req.files.forEach(file => {
                    if (file.filename) {
                        fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                    }
                });
            }
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Validate required fields
        if (!latitude || !longitude || !title || !description || !type || !date || !time) {
            console.log('Missing required fields:', { latitude, longitude, title, description, type, date, time });
            // Remove uploaded files if they exist
            if (req.files && Array.isArray(req.files)) {
                req.files.forEach(file => {
                    if (file.filename) {
                        fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                    }
                });
            }
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get photo filenames if files were uploaded
        console.log('Processing files:', req.files);
        const photos = req.files && Array.isArray(req.files) 
            ? req.files.map(file => {
                console.log('Processing file:', file);
                if (!file.filename) {
                    console.log('File has no filename:', file);
                    return null;
                }
                return file.filename;
            }).filter((filename): filename is string => filename !== null)
            : [];
        
        console.log('Final photos array:', photos);

        const ocurrenceData: Prisma.OcurrenceCreateInput = {
            latitude: Number(latitude),
            longitude: Number(longitude),
            title,
            description,
            type,
            date,
            time,
            photos,
            User: {
                connect: { id: user_id }
            },
            PoliceStation: police_station_id ? {
                connect: { id: police_station_id }
            } : undefined
        };

        console.log('Creating occurrence with data:', ocurrenceData);

        const ocurrence = await prisma.ocurrence.create({
            data: ocurrenceData,
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                },
                PoliceStation: true
            }
        });

        // Emitir evento de nova ocorrência
        emitOcurrence({
            id: ocurrence.id,
            title: ocurrence.title || "Nova Ocorrência",
            type: ocurrence.type || "Não especificado",
            latitude: ocurrence.latitude,
            longitude: ocurrence.longitude,
            date: ocurrence.date || new Date().toISOString().split('T')[0],
            time: ocurrence.time || new Date().toTimeString().split(' ')[0],
            user: ocurrence.User
        });

        // Criar notificação para nova ocorrência
        createNotification(
            user_id,
            "Nova Ocorrência",
            `Nova ocorrência registrada: ${title}`
        );

        logger.info(`Occurrence created successfully with ID: ${ocurrence.id}`);
        return res.status(201).json(ocurrence);

    } catch (error) {
        // Remove uploaded files if they exist
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (file.filename) {
                    fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                }
            });
        }

        logger.error('Error creating occurrence:', error);
        return res.status(500).json({ error: "Error creating occurrence" });
    }
};

const createQuickOcurrence = async (req: Request, res: Response) => {
    try {
        const { latitude, longitude, type, police_station_id, date, time } = req.body;
        const user_id = req.userId;

        if (!user_id) {
            // Remove uploaded files if they exist
            if (req.files && Array.isArray(req.files)) {
                req.files.forEach(file => {
                    if (file.filename) {
                        fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                    }
                });
            }
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Validate required fields
        if (!latitude || !longitude || !type || !date || !time) {
            // Remove uploaded files if they exist
            if (req.files && Array.isArray(req.files)) {
                req.files.forEach(file => {
                    if (file.filename) {
                        fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                    }
                });
            }
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get photo filenames if files were uploaded
        const photos = req.files && Array.isArray(req.files) 
            ? req.files.map(file => file.filename).filter(filename => filename !== undefined)
            : [];

        const ocurrenceData: Prisma.OcurrenceCreateInput = {
            latitude: Number(latitude),
            longitude: Number(longitude),
            title: "Ocorrência Rápida",
            description: "Ocorrência registrada via botão de emergência",
            type,
            date,
            time,
            photos,
            User: {
                connect: { id: user_id }
            },
            PoliceStation: police_station_id ? {
                connect: { id: police_station_id }
            } : undefined
        };

        const ocurrence = await prisma.ocurrence.create({
            data: ocurrenceData,
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                },
                PoliceStation: true
            }
        });

        // Emitir evento de nova ocorrência
        emitOcurrence({
            id: ocurrence.id,
            title: ocurrence.title || "Nova Ocorrência",
            type: ocurrence.type || "Não especificado",
            latitude: ocurrence.latitude,
            longitude: ocurrence.longitude,
            date: ocurrence.date || new Date().toISOString().split('T')[0],
            time: ocurrence.time || new Date().toTimeString().split(' ')[0],
            user: ocurrence.User
        });

        // Criar notificação para nova ocorrência
        createNotification(
            user_id,
            "Nova Ocorrência",
            `Nova ocorrência registrada: ${ocurrence.title}`
        );

        logger.info(`Quick occurrence created successfully with ID: ${ocurrence.id}`);
        return res.status(201).json(ocurrence);

    } catch (error) {
        // Remove uploaded files if they exist
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (file.filename) {
                    fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                }
            });
        }

        logger.error('Error creating quick occurrence:', error);
        return res.status(500).json({ error: "Error creating quick occurrence" });
    }
};

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
                status: true,
                photos: true,
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
                status: true,
                photos: true,
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
                type: 'VIOLENCIA_DOMESTICA'
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Contagem de violência doméstica realizada com sucesso",
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
                type: 'ROUBOS_E_FURTOS'
            }
        });

        return res.status(200).json({
            status: "success",
            message: "Contagem de roubos e furtos realizada com sucesso",
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
                status: true,
                photos: true,
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
        const { latitude, longitude, title, description, type, date, time, policeStation_id, status } = req.body;

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
            const validTypes = [
                'AGRESSOES_OU_BRIGAS',
                'APOIO_EM_ACIDENTES_DE_TRANSITO',
                'DEPREDACAO_DO_PATRIMONIO_PUBLICO',
                'EMERGENCIAS_AMBIENTAIS',
                'INVASAO_DE_PREDIOS_OU_TERRENOS_PUBLICOS',
                'MARIA_DA_PENHA',
                'PERTURBACAO_DO_SOSSEGO_PUBLICO',
                'POSSE_DE_ARMAS_BRANCAS_OU_DE_FOGO',
                'PESSOA_SUSPEITA',
                'ROUBOS_E_FURTOS',
                'TENTATIVA_DE_SUICIDIO',
                'USO_E_TRAFICO_DE_DROGAS',
                'VIOLENCIA_DOMESTICA',
                'OUTROS'
            ];

            if (typeof type !== 'string' || !validTypes.includes(type.toUpperCase())) {
                return res.status(400).json({
                    status: "error",
                    message: "Tipo inválido. Tipos permitidos: " + validTypes.join(', '),
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

        if (status !== undefined) {
            const validStatus = ['EM_ABERTO', 'ACEITO', 'ATENDIDO', 'ENCERRADO'];
            if (!validStatus.includes(status)) {
                return res.status(400).json({
                    status: "error",
                    message: "Status inválido. Status permitidos: " + validStatus.join(', '),
                    code: "INVALID_STATUS"
                });
            }
            updateData.status = status;
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
                status: true,
                photos: true,
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

const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "ID da ocorrência é obrigatório",
                code: "MISSING_ID"
            });
        }

        // Verificar se a ocorrência existe
        const existingOcurrence = await prisma.ocurrence.findUnique({
            where: { id }
        });

        if (!existingOcurrence) {
            return res.status(404).json({
                status: "error",
                message: "Ocorrência não encontrada",
                code: "OCCURRENCE_NOT_FOUND"
            });
        }

        // Validar status
        const validStatus = ['EM_ABERTO', 'ACEITO', 'ATENDIDO', 'ENCERRADO'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({
                status: "error",
                message: "Status inválido. Status permitidos: " + validStatus.join(', '),
                code: "INVALID_STATUS"
            });
        }

        const updatedOcurrence = await prisma.ocurrence.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                latitude: true,
                longitude: true,
                date: true,
                time: true,
                status: true,
                photos: true,
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
            message: "Status da ocorrência atualizado com sucesso",
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
        const deleteConditions = (user.Permission.role === 'ADMIN' || user.Permission.role === 'SUPERADMIN')
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

const addPhotos = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;

        if (!user_id) {
            // Remove uploaded files if they exist
            if (req.files && Array.isArray(req.files)) {
                req.files.forEach(file => {
                    if (file.filename) {
                        fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                    }
                });
            }
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Check if files were uploaded
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: "No photos provided" });
        }

        // Get the occurrence
        const occurrence = await prisma.ocurrence.findUnique({
            where: { id },
            include: {
                User: true,
                PoliceStation: true
            }
        });

        if (!occurrence) {
            // Remove uploaded files
            req.files.forEach(file => {
                if (file.filename) {
                    fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                }
            });
            return res.status(404).json({ error: "Occurrence not found" });
        }

        // Check if user owns the occurrence
        if (occurrence.user_id !== user_id) {
            // Remove uploaded files
            req.files.forEach(file => {
                if (file.filename) {
                    fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                }
            });
            return res.status(403).json({ error: "Not authorized to modify this occurrence" });
        }

        // Get existing photos and new photo filenames
        const existingPhotos = occurrence.photos || [];
        const newPhotos = req.files.map(file => file.filename);

        // Update occurrence with combined photos
        const updatedOccurrence = await prisma.ocurrence.update({
            where: { id },
            data: {
                photos: [...existingPhotos, ...newPhotos]
            },
            include: {
                User: true,
                PoliceStation: true
            }
        });

        logger.info(`Photos added to occurrence ID: ${id}`);
        return res.status(200).json(updatedOccurrence);

    } catch (error) {
        // Remove uploaded files if they exist
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (file.filename) {
                    fs.unlinkSync(path.join(__dirname, '../../../uploads', file.filename));
                }
            });
        }

        logger.error('Error adding photos to occurrence:', error);
        return res.status(500).json({ error: "Error adding photos to occurrence" });
    }
}

const createPanicOcurrence = async (req: Request, res: Response) => {
    try {
        const { userId } = req;
        const { latitude, longitude } = req.body;

        const user = await User.findUnique({
            where: { id: userId },
            select: {
                Permission: {
                    select: {
                        role: true
                    }
                }
            }
        });

        if (!user || user.Permission.role !== 'GRUPO_DE_RISCO') {
            return res.status(403).json({
                message: "Apenas usuários do Grupo de Risco podem criar ocorrências de pânico"
            });
        }

        const ocurrence = await Ocurrence.create({
            data: {
                title: "Botão de Pânico Ativado",
                description: "Botão de pânico foi ativado em estabelecimento de risco",
                type: "PANIC",
                latitude,
                longitude,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().split(' ')[0],
                user_id: userId
            }
        });

        // Aqui você pode adicionar lógica para notificar a guarda municipal
        // e outras autoridades relevantes

        return res.status(201).json(ocurrence);
    } catch (error) {
        console.error("Erro ao criar ocorrência de pânico:", error);
        return res.status(500).json({
            message: "Erro ao criar ocorrência de pânico"
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
    updateStatus,
    remove,
    addPhotos,
    createPanicOcurrence
};