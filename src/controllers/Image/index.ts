import { Request, Response } from "express";
import Image from "../../models/Image";
import fs from 'fs';
import path from 'path';

// Upload de imagem
const upload = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded!" });
        }

        const { filename, path: filePath } = req.file;
        const userId = req.user.id; // ID do usuário logado

        const image = await Image.create({
            data: {
                filename,
                path: filePath,
                userId
            }
        });

        return res.status(201).json(image);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error uploading image!" });
    }
};

// Obter imagens do usuário logado
const getUserImages = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        const images = await Image.findMany({
            where: {
                userId
            }
        });

        return res.json(images);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching user images!" });
    }
};

// Obter uma imagem específica
const getImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const image = await Image.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!image) {
            return res.status(404).json({ message: "Image not found!" });
        }

        return res.json(image);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching image!" });
    }
};

// Atualizar imagem
const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifica se a imagem existe e pertence ao usuário
        const existingImage = await Image.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!existingImage) {
            return res.status(404).json({ message: "Image not found!" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded!" });
        }

        // Remove o arquivo antigo
        fs.unlinkSync(existingImage.path);

        // Atualiza com o novo arquivo
        const { filename, path: filePath } = req.file;
        const image = await Image.update({
            where: { id },
            data: {
                filename,
                path: filePath
            }
        });

        return res.json(image);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error updating image!" });
    }
};

// Deletar imagem
const remove = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const image = await Image.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!image) {
            return res.status(404).json({ message: "Image not found!" });
        }

        // Remove o arquivo físico
        fs.unlinkSync(image.path);

        // Remove o registro do banco
        await Image.delete({
            where: { id }
        });

        return res.json({ message: "Image deleted successfully!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error deleting image!" });
    }
};

export default {
    upload,
    getUserImages,
    getImage,
    update,
    remove
};