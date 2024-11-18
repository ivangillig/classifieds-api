// src/services/imageService.js

import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Configure multer storage for image uploads.
 * @param {string} baseDir - The base directory for uploads.
 * @returns {object} - Multer storage configuration.
 */
export const configureMulterStorage = (baseDir) => ({
  destination: (req, file, cb) => {
    const uploadPath = path.join(baseDir, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(6).toString("hex");
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

/**
 * Delete images from the server.
 * @param {Array<string>} fileNames - Array of filenames to delete.
 * @param {string} baseDir - The base directory for uploads.
 */
export const deleteImages = (fileNames, baseDir) => {
  fileNames.forEach((filename) => {
    const filePath = path.join(baseDir, "uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};
