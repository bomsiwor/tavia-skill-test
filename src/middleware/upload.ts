import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Ensure the directory exists before attempting to save files
const uploadDirectory = "./resources/static/assets/uploads";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: Function) => {
    cb(null, uploadDirectory);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: Function) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Custom file filter function for CSV files
const csvFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.includes("csv")) {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

// Initialize multer middleware with storage and file filter
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: csvFilter,
});

export default uploadMiddleware;
