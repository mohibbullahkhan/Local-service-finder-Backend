import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { env } from '../config/env';

export interface StorageService {
  saveFile(file: Express.Multer.File): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

const getUploadsDir = () => {
  if (process.env.VERCEL) {
    return '/tmp';
  }
  const dir = path.join(process.cwd(), 'uploads');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    return '/tmp';
  }
  return dir;
};

class LocalStorageService implements StorageService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    const uploadsDir = getUploadsDir();
    let ext = path.extname(file.originalname || '');
    if (!ext) {
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/gif') ext = '.gif';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else ext = '.jpg';
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    if (file.buffer) {
      await fs.promises.writeFile(filePath, file.buffer);
    } else if (file.path) {
      await fs.promises.rename(file.path, filePath);
    }

    return `/uploads/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl.startsWith('/uploads/')) return;
    const uploadsDir = getUploadsDir();
    const filename = fileUrl.replace('/uploads/', '');
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

class CloudinaryStorageService implements StorageService {
  async saveFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'localconnect_uploads' },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve(result.secure_url);
        }
      );

      if (file.buffer) {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } else if (file.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
      } else {
        reject(new Error('No file buffer or path provided for upload'));
      }
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const match = fileUrl.match(/\/v\d+\/([^/]+\/[^.]+)\./);
      if (match && match[1]) {
        await cloudinary.uploader.destroy(match[1]);
      }
    } catch (err) {
      console.error('Failed to delete file from Cloudinary:', err);
    }
  }
}

export const storageService: StorageService = isCloudinaryConfigured
  ? new CloudinaryStorageService()
  : new LocalStorageService();
