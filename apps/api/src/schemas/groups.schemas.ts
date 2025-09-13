import { z } from 'zod';

/**
 * Esquemas de validación para grupos
 */

export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'El nombre del grupo debe tener al menos 2 caracteres')
      .max(100, 'El nombre del grupo es demasiado largo')
      .trim(),
    description: z
      .string()
      .max(500, 'La descripción es demasiado larga')
      .trim()
      .optional()
      .nullable(),
    currency: z
      .string()
      .length(3, 'El código de moneda debe tener 3 caracteres')
      .regex(/^[A-Z]{3}$/, 'Código de moneda inválido (ej: USD, EUR, ARS)')
      .default('USD'),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'El nombre del grupo debe tener al menos 2 caracteres')
      .max(100, 'El nombre del grupo es demasiado largo')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, 'La descripción es demasiado larga')
      .trim()
      .optional()
      .nullable(),
    currency: z
      .string()
      .length(3, 'El código de moneda debe tener 3 caracteres')
      .regex(/^[A-Z]{3}$/, 'Código de moneda inválido (ej: USD, EUR, ARS)')
      .optional(),
  }),
});

export const groupParamsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .min(1, 'ID del grupo requerido'),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Email inválido')
      .toLowerCase()
      .trim(),
  }),
});
