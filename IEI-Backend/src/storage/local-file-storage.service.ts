import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FileStorageService, SaveFileOptions } from './file-storage.interface';

@Injectable()
export class LocalFileStorageService implements FileStorageService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'photos');

  constructor() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async savePhoto(options: SaveFileOptions): Promise<string> {
    const filename = `${options.memberId}.${options.extension}`;
    const filePath = path.join(this.uploadsDir, filename);

    // Replace old photo if it exists with a different extension
    const existingFiles = fs.readdirSync(this.uploadsDir);
    for (const file of existingFiles) {
      if (file.startsWith(`${options.memberId}.`)) {
        try {
          fs.unlinkSync(path.join(this.uploadsDir, file));
        } catch {}
      }
    }

    fs.writeFileSync(filePath, options.buffer);
    return filename;
  }

  async getPhotoBuffer(photoKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!photoKey) return null;
    const filePath = path.join(this.uploadsDir, photoKey);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(photoKey).toLowerCase().replace('.', '');
    let mimeType = 'image/jpeg';
    if (ext === 'png') mimeType = 'image/png';
    if (ext === 'webp') mimeType = 'image/webp';

    return { buffer, mimeType };
  }

  async deletePhoto(photoKey: string): Promise<void> {
    if (!photoKey) return;
    const filePath = path.join(this.uploadsDir, photoKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private readonly receiptsDir = path.join(process.cwd(), 'uploads', 'receipts');

  async saveReceipt(options: import('./file-storage.interface').SaveReceiptOptions): Promise<string> {
    if (!fs.existsSync(this.receiptsDir)) {
      fs.mkdirSync(this.receiptsDir, { recursive: true });
    }
    const filename = `${options.declarationId}.${options.extension}`;
    const filePath = path.join(this.receiptsDir, filename);

    fs.writeFileSync(filePath, options.buffer);
    return `uploads/receipts/${filename}`;
  }

  async getReceiptBuffer(receiptKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!receiptKey) return null;
    const filename = path.basename(receiptKey);
    const filePath = path.join(this.receiptsDir, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    let mimeType = 'application/octet-stream';
    if (ext === 'pdf') mimeType = 'application/pdf';
    else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';

    return { buffer, mimeType };
  }

  async deleteReceipt(receiptKey: string): Promise<void> {
    if (!receiptKey) return;
    const filename = path.basename(receiptKey);
    const filePath = path.join(this.receiptsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private readonly documentsDir = path.join(process.cwd(), 'uploads', 'documents');

  async saveMembershipDocument(options: import('./file-storage.interface').SaveMembershipDocumentOptions): Promise<string> {
    if (!fs.existsSync(this.documentsDir)) {
      fs.mkdirSync(this.documentsDir, { recursive: true });
    }
    const cleanDocType = options.documentType.toLowerCase();
    const filename = `${options.applicationId}_${cleanDocType}.${options.extension}`;
    const filePath = path.join(this.documentsDir, filename);

    // Delete existing file for this application + documentType if it exists with different extension
    const existing = fs.readdirSync(this.documentsDir);
    for (const f of existing) {
      if (f.startsWith(`${options.applicationId}_${cleanDocType}.`)) {
        try {
          fs.unlinkSync(path.join(this.documentsDir, f));
        } catch {}
      }
    }

    fs.writeFileSync(filePath, options.buffer);
    return `uploads/documents/${filename}`;
  }

  async getMembershipDocumentBuffer(storageKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!storageKey) return null;
    const filename = path.basename(storageKey);
    const filePath = path.join(this.documentsDir, filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    let mimeType = 'application/octet-stream';
    if (ext === 'pdf') mimeType = 'application/pdf';
    else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
    else if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';

    return { buffer, mimeType };
  }

  async deleteMembershipDocument(storageKey: string): Promise<void> {
    if (!storageKey) return;
    const filename = path.basename(storageKey);
    const filePath = path.join(this.documentsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
