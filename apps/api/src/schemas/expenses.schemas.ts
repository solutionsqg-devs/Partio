import { z } from 'zod';

/**
 * Esquemas de validación para gastos
 */

const splitSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  amount: z.number().positive('El monto debe ser positivo'),
  type: z.enum(['EQUAL', 'EXACT', 'PERCENTAGE'], {
    errorMap: () => ({ message: 'Tipo de división inválido' }),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, 'El título debe tener al menos 2 caracteres')
      .max(200, 'El título es demasiado largo')
      .trim(),
    description: z
      .string()
      .max(1000, 'La descripción es demasiado larga')
      .trim()
      .optional()
      .nullable(),
    amount: z
      .number()
      .positive('El monto debe ser positivo')
      .max(999999.99, 'El monto es demasiado alto'),
    currency: z
      .string()
      .length(3, 'El código de moneda debe tener 3 caracteres')
      .regex(/^[A-Z]{3}$/, 'Código de moneda inválido')
      .default('USD'),
    category: z
      .string()
      .max(50, 'La categoría es demasiado larga')
      .trim()
      .optional()
      .nullable(),
    splits: z
      .array(splitSchema)
      .min(1, 'Debe haber al menos un participante')
      .max(50, 'Demasiados participantes'),
  }),
  params: z.object({
    groupId: z.string().min(1, 'ID del grupo requerido'),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, 'El título debe tener al menos 2 caracteres')
      .max(200, 'El título es demasiado largo')
      .trim()
      .optional(),
    description: z
      .string()
      .max(1000, 'La descripción es demasiado larga')
      .trim()
      .optional()
      .nullable(),
    amount: z
      .number()
      .positive('El monto debe ser positivo')
      .max(999999.99, 'El monto es demasiado alto')
      .optional(),
    currency: z
      .string()
      .length(3, 'El código de moneda debe tener 3 caracteres')
      .regex(/^[A-Z]{3}$/, 'Código de moneda inválido')
      .optional(),
    category: z
      .string()
      .max(50, 'La categoría es demasiado larga')
      .trim()
      .optional()
      .nullable(),
    splits: z
      .array(splitSchema)
      .min(1, 'Debe haber al menos un participante')
      .max(50, 'Demasiados participantes')
      .optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'ID del gasto requerido'),
  }),
});

export const expenseParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID del gasto requerido'),
  }),
});

export const groupExpensesParamsSchema = z.object({
  params: z.object({
    groupId: z.string().min(1, 'ID del grupo requerido'),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Página debe ser un número')
      .transform(Number)
      .refine(n => n > 0, 'Página debe ser mayor a 0')
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/, 'Límite debe ser un número')
      .transform(Number)
      .refine(n => n > 0 && n <= 100, 'Límite debe estar entre 1 y 100')
      .default('20'),
  }).optional(),
});
