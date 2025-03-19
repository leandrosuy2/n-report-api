import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Criar diretório de uploads se não existir
const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Gera um nome único para o arquivo
        const hash = crypto.randomBytes(16).toString("hex");
        const fileName = `${hash}-${file.originalname}`;
        cb(null, fileName);
    }
});

// Configuração dos tipos de arquivos permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/gif"
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type."));
    }
};

// Configuração completa do multer
const uploadsConfig = {
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
};

export { uploadsConfig };