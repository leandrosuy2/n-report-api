import { Request, Response } from "express";
import { createHashPassword, compareHashWithTextPassword } from "../../utils/bcrypt";
import User from "../../models/User";
import Permission from "../../models/Permission";
import logger from "../../utils/logger";

interface IUserCreateDTO {
    name: string,
    email: string,
    password: string,
    cpf: string
}

const createAdminUser = async (req: Request, res: Response) => {
    try {
        const userToCreate: IUserCreateDTO = req.body;

        // Validate required fields
        if (!userToCreate.name || !userToCreate.email || !userToCreate.password || !userToCreate.cpf) {
            logger.error('Missing required fields for user creation');
            return res.status(400).send({ 
                message: "Missing required fields",
                details: "Name, email, password and CPF are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userToCreate.email)) {
            logger.error(`Invalid email format: ${userToCreate.email}`);
            return res.status(400).send({ 
                message: "Invalid email format" 
            });
        }

        userToCreate.password = await createHashPassword(userToCreate.password);

        const userPermission = await Permission.findFirst({ where: { role: 'admin' } });

        if (!userPermission) {
            logger.error('Admin role permission not found');
            return res.status(400).send({ message: "Admin role not found in the system" });
        }

        const avatar = req.file ? req.file.filename : '';

        // Check if user with email already exists
        const existingUser = await User.findFirst({ where: { email: userToCreate.email } });
        if (existingUser) {
            logger.warn(`Attempted to create user with existing email: ${userToCreate.email}`);
            return res.status(409).send({ message: "User with this email already exists" });
        }

        const userResponse = await User.create({
            data: {
                ...userToCreate,
                avatar: avatar,
                permission_id: userPermission.id
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true
            }
        });

        logger.info(`Admin user created successfully: ${userResponse.id}`);
        res.status(201).send(userResponse);
    } catch (error: any) {
        logger.error('Error creating admin user:', { error: error.message, stack: error.stack });
        res.status(500).send({
            message: "Error creating user",
            details: error.message
        });
    }
}

const findAll = async (req: Request, res: Response) => {
    try {
        const allUsers = await User.findMany({
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        logger.info(`Retrieved ${allUsers.length} users`);
        res.status(200).send(allUsers);
    } catch (error: any) {
        logger.error('Error fetching all users:', { error: error.message, stack: error.stack });
        res.status(500).send({
            message: "Error fetching users",
            details: error.message
        });
    }
}

const findById = async (req: Request, res: Response) => {
    try {
        const id = req.params?.id;

        if (!id) {
            logger.error('User ID not provided in request');
            return res.status(400).send({ message: "User ID is required" });
        }

        const user = await User.findFirst({
            where: { id: id },
            select: {
                id: true,
                avatar: true,
                name: true,
                email: true,
                cpf: true,
                created_at: true,
                updated_at: true,
                Permission: {
                    select: {
                        role: true
                    }
                }
            }
        });

        if (user) {
            const avatarUrl = user.avatar
                ? `${req.protocol}://${req.get('host')}/images/${user.avatar}`
                : null;

            logger.info(`User found: ${id}`);
            return res.status(200).send({
                ...user,
                avatar: avatarUrl
            });
        }

        logger.warn(`User not found with ID: ${id}`);
        res.status(404).send({
            message: "User not found",
            details: `No user exists with ID: ${id}`
        });
    } catch (error: any) {
        logger.error('Error finding user by ID:', { id: req.params?.id, error: error.message, stack: error.stack });
        res.status(500).send({
            message: "Error finding user",
            details: error.message
        });
    }
}

const profile = async (req: Request, res: Response) => {
    try {
        const id = req.userId;

        if (!id) {
            logger.error('User ID not found in request');
            return res.status(400).send({
                message: "User ID is required"
            });
        }

        const user = await User.findFirst({
            where: { id: id },
            select: {
                id: true,
                avatar: true,
                name: true,
                email: true,
                cpf: true,
                created_at: true,
                updated_at: true,
                Permission: {
                    select: {
                        role: true
                    }
                }
            }
        });

        if (user) {
            const avatarUrl = user.avatar
                ? `${req.protocol}://${req.get('host')}/images/${user.avatar}`
                : null;

            logger.info(`Profile retrieved for user: ${id}`);
            return res.status(200).send({
                ...user,
                avatar: avatarUrl
            });
        }

        logger.warn(`Profile not found for user: ${id}`);
        res.status(404).send({
            message: "User not found"
        });
    } catch (error: any) {
        logger.error('Error retrieving user profile:', { userId: req.userId, error: error.message });
        res.status(500).send({
            message: "Error retrieving user profile",
            details: error.message
        });
    }
}

const update = async (req: Request, res: Response) => {
    try {
        const id = req.params?.id;

        if (!id) {
            logger.error('User ID not provided for update');
            return res.status(400).send({
                message: "User ID is required"
            });
        }

        const userToCreate: IUserCreateDTO = req.body;

        // Validate required fields
        if (!userToCreate.name || !userToCreate.email || !userToCreate.password || !userToCreate.cpf) {
            logger.error('Missing required fields for user update');
            return res.status(400).send({ 
                message: "Missing required fields",
                details: "Name, email, password and CPF are required"
            });
        }

        const avatar = req.file ? req.file.filename : '';

        const user = await updateUser(id, userToCreate, avatar);

        if (user) {
            const avatarUrl = user.avatar
                ? `${req.protocol}://${req.get('host')}/images/${user.avatar}`
                : null;

            logger.info(`User updated successfully: ${id}`);
            return res.status(200).send({
                ...user,
                avatar: avatarUrl
            });
        }

        logger.warn(`User not found for update: ${id}`);
        res.status(404).send({
            message: "User not found"
        });
    } catch (error: any) {
        logger.error('Error updating user:', { userId: req.params?.id, error: error.message });
        res.status(500).send({
            message: "Error updating user",
            details: error.message
        });
    }
}

const updateUser = async (userId: string, userToCreate: IUserCreateDTO, avatar: string) => {
    try {
        // Validate user exists before update
        const existingUser = await User.findFirst({ where: { id: userId } });
        if (!existingUser) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Validate password before hashing
        if (!userToCreate.password || typeof userToCreate.password !== 'string') {
            throw new Error('Invalid password provided');
        }

        try {
            userToCreate.password = await createHashPassword(userToCreate.password);
        } catch (hashError: any) {
            logger.error('Error hashing password:', { userId, error: hashError.message });
            throw new Error('Error processing password');
        }

        return await User.update({
            where: { id: userId },
            data: {
                ...userToCreate,
                avatar: avatar
            },
            select: {
                id: true,
                avatar: true,
                name: true,
                email: true,
                cpf: true,
                created_at: true,
                updated_at: true,
                Permission: {
                    select: {
                        role: true
                    }
                }
            }
        });
    } catch (error: any) {
        logger.error('Error updating user:', { userId, error: error.message });
        throw error;
    }
}

const updateSelf = async (req: Request, res: Response) => {
    try {
        const id = req.userId;

        if (!id) {
            logger.error('User ID not found in request for self update');
            return res.status(400).send({
                message: "User ID is required"
            });
        }

        const userToCreate: IUserCreateDTO = req.body;

        // Validate required fields
        if (!userToCreate.name || !userToCreate.email || !userToCreate.password || !userToCreate.cpf) {
            logger.error('Missing required fields for self update');
            return res.status(400).send({ 
                message: "Missing required fields",
                details: "Name, email, password and CPF are required"
            });
        }

        // Validate password
        if (!userToCreate.password || typeof userToCreate.password !== 'string') {
            logger.error('Invalid password format in self update');
            return res.status(400).send({
                message: "Invalid password format"
            });
        }

        const avatar = req.file ? req.file.filename : '';

        try {
            const user = await updateUser(id as string, userToCreate, avatar);

            if (user) {
                const avatarUrl = user.avatar
                    ? `${req.protocol}://${req.get('host')}/images/${user.avatar}`
                    : null;

                logger.info(`User self-updated successfully: ${id}`);
                return res.status(200).send({
                    ...user,
                    avatar: avatarUrl
                });
            }

            logger.warn(`User not found for self update: ${id}`);
            return res.status(404).send({
                message: "User not found"
            });
        } catch (updateError: any) {
            logger.error('Error in self update:', { userId: id, error: updateError.message });
            return res.status(500).send({
                message: "Error updating user",
                details: updateError.message
            });
        }
    } catch (error: any) {
        logger.error('Error in self update:', { userId: req.userId, error: error.message });
        res.status(500).send({
            message: "Error updating user",
            details: error.message
        });
    }
}

const updatePassword = async (req: Request, res: Response) => {
    try {
        const id = req.userId;
        const { actualPass, newPass } = req.body;

        if (!actualPass || !newPass) {
            logger.error('Missing password fields in update request');
            return res.status(400).send({
                message: "Both current and new password are required"
            });
        }

        if (newPass.length < 6) {
            logger.warn('Password update attempted with too short password');
            return res.status(400).send({
                message: "New password must be at least 6 characters long"
            });
        }

        const user = await User.findFirst({
            where: { id },
            select: { password: true }
        });

        if (!user) {
            logger.error(`User not found for password update: ${id}`);
            return res.status(404).send({
                message: "User not found"
            });
        }

        const hashPass = await compareHashWithTextPassword(actualPass, user.password);

        if (!hashPass) {
            logger.warn(`Invalid current password provided for user: ${id}`);
            return res.status(400).send({
                message: "Current password is incorrect"
            });
        }

        const senhaNova = await createHashPassword(newPass);

        await User.update({
            where: { id },
            data: { password: senhaNova },
            select: {
                id: true,
                password: true,
            }
        });

        logger.info(`Password updated successfully for user: ${id}`);
        return res.status(200).send({
            message: "Password updated successfully"
        });

    } catch (error: any) {
        logger.error('Error updating password:', { userId: req.userId, error: error.message, stack: error.stack });
        res.status(500).send({
            message: "Error updating password",
            details: error.message
        });
    }
}

const updateEmail = async (req: Request, res: Response) => {
    try {
        const id = req.userId;
        const { email } = req.body;

        if (!email) {
            logger.error('Email not provided for update');
            return res.status(400).send({
                message: "Email is required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            logger.error(`Invalid email format: ${email}`);
            return res.status(400).send({ 
                message: "Invalid email format" 
            });
        }

        // Check if email is already in use
        const existingUser = await User.findFirst({ 
            where: { 
                email,
                NOT: { id }
            } 
        });

        if (existingUser) {
            logger.warn(`Email already in use: ${email}`);
            return res.status(409).send({
                message: "Email already in use by another user"
            });
        }

        await User.update({
            where: { id },
            data: { email }
        });

        logger.info(`Email updated successfully for user: ${id}`);
        return res.status(200).send({
            message: "Email updated successfully"
        });
    } catch (error: any) {
        logger.error('Error updating email:', { userId: req.userId, error: error.message });
        res.status(500).send({
            message: "Error updating email",
            details: error.message
        });
    }
}

const remove = async (req: Request, res: Response) => {
    try {
        const id = req.params?.id;

        if (!id) {
            logger.error('User ID not provided for deletion');
            return res.status(400).send({
                message: "User ID is required"
            });
        }

        const user = await User.delete({ where: { id } });

        if (user) {
            logger.info(`User deleted successfully: ${id}`);
            return res.status(200).send({
                message: "User deleted successfully"
            });
        }

        logger.warn(`User not found for deletion: ${id}`);
        res.status(404).send({
            message: "User not found"
        });
    } catch (error: any) {
        logger.error('Error deleting user:', { userId: req.params?.id, error: error.message });
        res.status(500).send({
            message: "Error deleting user",
            details: error.message
        });
    }
}

const removeSelf = async (req: Request, res: Response) => {
    try {
        const id = req.userId;

        if (!id) {
            logger.error('User ID not found in request for self deletion');
            return res.status(400).send({
                message: "User ID is required"
            });
        }

        const user = await User.delete({ where: { id } });

        if (user) {
            logger.info(`User self-deleted successfully: ${id}`);
            return res.status(200).send({
                message: "Account deleted successfully"
            });
        }

        logger.warn(`User not found for self deletion: ${id}`);
        res.status(404).send({
            message: "User not found"
        });
    } catch (error: any) {
        logger.error('Error in self deletion:', { userId: req.userId, error: error.message });
        res.status(500).send({
            message: "Error deleting account",
            details: error.message
        });
    }
}

export default {
    createAdminUser,
    findAll,
    findById,
    profile,
    update,
    updateSelf,
    updatePassword,
    updateEmail,
    remove,
    removeSelf,
}