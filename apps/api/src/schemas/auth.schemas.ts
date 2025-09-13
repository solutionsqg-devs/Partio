import { z } from 'zod';

/**
 * Esquemas de validación para autenticación
 * Usando Zod para validación de tipos y datos de entrada
 */

export const signupSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Email inválido')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña es demasiado larga'),
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre es demasiado largo')
      .trim(),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Email inválido')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, 'La contraseña es requerida'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre es demasiado largo')
      .trim()
      .optional(),
    avatar: z
      .string()
      .url('URL de avatar inválida')
      .optional()
      .nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
      .max(100, 'La nueva contraseña es demasiado larga'),
  }),
});
