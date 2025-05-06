import { Request as ExpressRequest } from 'express';
import { File } from 'multer';

declare module 'express' {
  export interface Request extends ExpressRequest {
    userId?: string;
    files?: File[] | { [fieldname: string]: File[] } | undefined;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    files?: File[] | { [fieldname: string]: File[] } | undefined;
  }
}