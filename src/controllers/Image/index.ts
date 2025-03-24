import { Request, Response } from "express";
import Image from "../../models/Image";
import fs from 'fs';
import path from 'path';

// Extend Request type to include userId
declare module "express" {
  interface Request {
    userId?: string;
  }
}

// Upload de imagem
const upload = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded!" });
        }

        const { filename, path: filePath } = req.file;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

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
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

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
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                status: "error",
                message: "Nome do arquivo é obrigatório",
                code: "MISSING_FILENAME"
            });
        }

        const filePath = path.join(__dirname, '../../../uploads', filename);

        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                status: "error",
                message: "Imagem não encontrada",
                code: "IMAGE_NOT_FOUND"
            });
        }

        // Servir o arquivo
        res.sendFile(filePath);

    } catch (error) {
        console.error("Erro ao buscar imagem:", error);
        return res.status(500).json({
            status: "error",
            message: "Erro ao buscar imagem",
            details: error
        });
    }
};

// Atualizar imagem
const update = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

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
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

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