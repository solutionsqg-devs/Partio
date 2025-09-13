/**
 * Extensiones de tipos para Express
 * Añade propiedades personalizadas a Request
 */

import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
