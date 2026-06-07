import { Injectable, Logger } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getApiEnv } from '@/config/env';

export interface UploadedImageFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

export interface SavedMediaFile {
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

@Injectable()
export class MediaStorageService {
  private readonly logger = new Logger(MediaStorageService.name);
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  async saveImage(file: UploadedImageFile, folder: string): Promise<SavedMediaFile> {
    return this.saveFile(file, folder);
  }

  async saveReceipt(file: UploadedImageFile, folder = 'payment-receipts'): Promise<SavedMediaFile> {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      throw new Error('Unsupported receipt file type');
    }
    return this.saveFile(file, folder);
  }

  private async saveFile(file: UploadedImageFile, folder: string): Promise<SavedMediaFile> {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const ext = this.extensionFromMime(file.mimetype) ?? this.extensionFromName(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const dir = join(this.uploadRoot, safeFolder);
    await mkdir(dir, { recursive: true });
    const absolutePath = join(dir, filename);
    await writeFile(absolutePath, file.buffer);

    const env = getApiEnv();
    const base = `http://localhost:${env.API_PORT}`;
    const url = `${base}/${env.API_PREFIX}/v${env.API_VERSION}/media-files/${safeFolder}/${filename}`;

    this.logger.debug(`Saved media file ${absolutePath}`);

    return {
      filename,
      url,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  private extensionFromMime(mime: string): string | null {
    if (mime === 'image/jpeg') return '.jpg';
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    if (mime === 'image/gif') return '.gif';
    if (mime === 'application/pdf') return '.pdf';
    return null;
  }

  private extensionFromName(name: string): string {
    const dot = name.lastIndexOf('.');
    if (dot === -1) return '.jpg';
    return name.slice(dot).toLowerCase();
  }

  async deleteByPublicUrl(url: string): Promise<void> {
    const match = url.match(/\/media-files\/([^/]+)\/([^/?#]+)/);
    if (!match) {
      return;
    }

    const [, folder, filename] = match;
    const absolutePath = join(this.uploadRoot, folder, filename);

    try {
      await unlink(absolutePath);
      this.logger.debug(`Deleted media file ${absolutePath}`);
    } catch {
      // File may already be missing — ignore.
    }
  }
}
