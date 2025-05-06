import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Definir o caminho do diretório de uploads
const UPLOADS_DIR = process.env.NODE_ENV === 'production' 
    ? '/nreportapi/uploads'
    : path.resolve(__dirname, "..", "..", "uploads");

console.log('Upload directory:', UPLOADS_DIR);

if (!fs.existsSync(UPLOADS_DIR)) {
    console.log('Creating upload directory...');
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuração do armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer destination called for file:', file.originalname);
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Gera um nome único para o arquivo
        const hash = crypto.randomBytes(16).toString("hex");
        const fileName = `${hash}-${file.originalname}`;
        console.log('Generated filename:', fileName);
        cb(null, fileName);
    }
});

// Configuração dos tipos de arquivos permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('File filter called for file:', file.originalname, 'mimetype:', file.mimetype);
    
    const allowedMimes = [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/gif"
    ];

    if (allowedMimes.includes(file.mimetype)) {
        console.log('File type allowed');
        cb(null, true);
    } else {
        console.log('File type not allowed');
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

// Configuração para upload de múltiplos arquivos
const multipleUploads = multer(uploadsConfig).fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'documentPhoto', maxCount: 1 },
    { name: 'documentSelfie', maxCount: 1 },
    { name: 'photos', maxCount: 5 }
]);

// Configuração para upload de fotos de ocorrência
const photosUpload = multer(uploadsConfig).array('photos', 5);

// Exportar configurações
export { uploadsConfig, multipleUploads, photosUpload };