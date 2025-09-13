import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '@/lib/logger.js';

/**
 * Middleware de validación usando Zod
 * Valida body, query params y params de la URL
 */
export const validate = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validar body si se proporciona schema
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validar query params si se proporciona schema
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      // Validar params si se proporciona schema
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Error de validación:', {
          errors: error.errors,
          url: req.url,
          method: req.method,
        });

        res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            ...(('received' in err) && { received: err.received }),
            ...(('expected' in err) && { expected: err.expected }),
          })),
        });
        return;
      }

      next(error);
    }
  };
};
