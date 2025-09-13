import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Middleware global de manejo de errores
 * Centraliza el manejo de errores siguiendo principios de Clean Architecture
 */
export const errorHandler = (
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let details: any = undefined;

  // Log del error para observabilidad
  logger.error('Error capturado:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Manejo específico por tipo de error
  if (error instanceof ZodError) {
    // Errores de validación con Zod
    statusCode = 400;
    message = 'Datos de entrada inválidos';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Errores conocidos de Prisma
    statusCode = 400;
    
    switch (error.code) {
      case 'P2002':
        message = 'Ya existe un registro con estos datos únicos';
        details = { field: error.meta?.target };
        break;
      case 'P2025':
        message = 'Registro no encontrado';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Violación de restricción de clave foránea';
        break;
      default:
        message = 'Error de base de datos';
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Errores de validación de Prisma
    statusCode = 400;
    message = 'Datos inválidos para la base de datos';
  } else if ((error as AppError).statusCode) {
    // Errores personalizados de la aplicación
    statusCode = (error as AppError).statusCode!;
    message = error.message;
  }

  // En desarrollo, incluir stack trace
  const response: any = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware para capturar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.path} no encontrada`,
  });
};

/**
 * Wrapper para funciones async que automáticamente captura errores
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Crear error personalizado de aplicación
 */
export const createAppError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
