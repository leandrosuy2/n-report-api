import { Request as ExpressRequest } from 'express';
import { File } from 'multer';

declare module 'express' {
  export interface Request extends ExpressRequest {
    userId?: string;
    files?: {
      [fieldname: string]: File[];
    };
  }
}