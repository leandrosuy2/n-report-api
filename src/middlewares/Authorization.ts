import { NextFunction, Request, Response } from "express";
import User from "../models/User";

const unauthorizedMessage = "You don't have permission to access this resource";

const authorizationAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req;

        const user = await User.findUnique({
            where: {
                id: userId
            },
            select: {
                Permission: {
                    select: {
                        role: true
                    }
                }
            }
        })

        if (user?.Permission.role !== "ADMIN" && user?.Permission.role !== "SUPERADMIN") {
            return res.status(403).send({
                message: unauthorizedMessage
            })
        }

        next()
    } catch (error: any) {
        return res.status(403).send({
            message: unauthorizedMessage
        })
    }
}

const authorizationGrupoDeRisco = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req;

        const user = await User.findUnique({
            where: {
                id: userId
            },
            select: {
                Permission: {
                    select: {
                        role: true
                    }
                }
            }
        })

        if (user?.Permission.role !== "GRUPO_DE_RISCO") {
            return res.status(403).send({
                message: unauthorizedMessage
            })
        }

        next()
    } catch (error: any) {
        return res.status(403).send({
            message: unauthorizedMessage
        })
    }
}

const authorizationGuardinhaDaRua = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req;

        const user = await User.findUnique({
            where: {
                id: userId
            },
            select: {
                Permission: {
                    select: {
                        role: true
                    }
                }
            }
        })

        if (user?.Permission.role !== "GUARDINHA_DA_RUA") {
            return res.status(403).send({
                message: unauthorizedMessage
            })
        }

        next()
    } catch (error: any) {
        return res.status(403).send({
            message: unauthorizedMessage
        })
    }
}

export default {
    authorizationAdmin,
    authorizationGrupoDeRisco,
    authorizationGuardinhaDaRua
}