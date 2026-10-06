export interface SaveFileOptions {
  memberId: string;
  buffer: Buffer;
  extension: string;
  mimeType: string;
}

export interface SaveReceiptOptions {
  declarationId: string;
  buffer: Buffer;
  extension: string;
  mimeType: string;
}

export interface SaveMembershipDocumentOptions {
  applicationId: string;
  documentType: string;
  buffer: Buffer;
  extension: string;
  mimeType: string;
}

export interface FileStorageService {
  savePhoto(options: SaveFileOptions): Promise<string>;
  getPhotoBuffer(photoKey: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
  deletePhoto(photoKey: string): Promise<void>;

  saveReceipt(options: SaveReceiptOptions): Promise<string>;
  getReceiptBuffer(receiptKey: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
  deleteReceipt(receiptKey: string): Promise<void>;

  saveMembershipDocument(options: SaveMembershipDocumentOptions): Promise<string>;
  getMembershipDocumentBuffer(storageKey: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
  deleteMembershipDocument(storageKey: string): Promise<void>;
}

export const FILE_STORAGE_SERVICE = 'FILE_STORAGE_SERVICE';
