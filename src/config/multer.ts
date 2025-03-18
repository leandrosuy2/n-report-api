import multer from "multer";
import path from "path";
import crypto from "crypto";

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "..", "uploads"));
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

export { storage, fileFilter };