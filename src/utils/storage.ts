import fs from 'fs';
import path from 'path';

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

export interface StorageService {
  saveFile(file: Express.Multer.File): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
}

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

export const storageService = new LocalStorageService();
