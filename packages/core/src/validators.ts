import { z } from 'zod';
import { Currency, SplitType } from './types.js';
import { isSupportedCurrency } from './money.js';

/**
 * Validadores usando Zod para el core de Partio
 * Esquemas reutilizables para validación de datos
 */

// Validadores básicos
export const currencySchema = z.string().refine(
  (val): val is Currency => isSupportedCurrency(val),
  { message: 'Moneda no soportada' }
);

export const positiveAmountSchema = z.number().positive('El monto debe ser positivo');

export const userIdSchema = z.string().min(1, 'ID de usuario requerido');

export const splitTypeSchema = z.enum(['EQUAL', 'EXACT', 'PERCENTAGE'] as const);

// Esquemas para objetos complejos
export const moneySchema = z.object({
  amount: positiveAmountSchema,
  currency: currencySchema,
});

export const expenseMemberSchema = z.object({
  id: userIdSchema,
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email().optional(),
});

export const expenseSplitSchema = z.object({
  userId: userIdSchema,
  amount: positiveAmountSchema,
  type: splitTypeSchema,
  percentage: z.number().min(0).max(100).optional(),
});

export const customSplitSchema = z.object({
  userId: userIdSchema,
  amount: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
});

export const splitCalculationInputSchema = z.object({
  totalAmount: positiveAmountSchema,
  currency: currencySchema,
  members: z.array(expenseMemberSchema).min(1, 'Al menos un miembro requerido'),
  splitType: splitTypeSchema,
  customSplits: z.array(customSplitSchema).optional(),
}).refine((data) => {
  // Validación condicional: si es EXACT o PERCENTAGE, customSplits es requerido
  if ((data.splitType === 'EXACT' || data.splitType === 'PERCENTAGE') && !data.customSplits) {
    return false;
  }
  
  // Si hay customSplits, debe haber uno para cada miembro
  if (data.customSplits) {
    const memberIds = new Set(data.members.map(m => m.id));
    const splitIds = new Set(data.customSplits.map(s => s.userId));
    
    if (memberIds.size !== splitIds.size || 
        ![...splitIds].every(id => memberIds.has(id))) {
      return false;
    }
    
    // Para EXACT, todos deben tener amount
    if (data.splitType === 'EXACT') {
      return data.customSplits.every(s => s.amount !== undefined);
    }
    
    // Para PERCENTAGE, todos deben tener percentage
    if (data.splitType === 'PERCENTAGE') {
      return data.customSplits.every(s => s.percentage !== undefined);
    }
  }
  
  return true;
}, {
  message: 'Configuración de splits inválida para el tipo seleccionado',
});

export const expenseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  amount: positiveAmountSchema,
  currency: currencySchema,
  creatorId: userIdSchema,
  splits: z.array(expenseSplitSchema),
  date: z.date(),
});

export const groupBalanceSchema = z.object({
  userId: userIdSchema,
  userName: z.string().min(1),
  balance: z.number(),
});

export const settlementSchema = z.object({
  payerId: userIdSchema,
  receiverId: userIdSchema,
  amount: positiveAmountSchema,
  currency: currencySchema,
});

export const currencyRateSchema = z.object({
  from: currencySchema,
  to: currencySchema,
  rate: positiveAmountSchema,
  date: z.date(),
});

// Validadores para formularios de entrada
export const createExpenseFormSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  amount: positiveAmountSchema.max(999999.99),
  currency: currencySchema,
  category: z.string().max(50).optional(),
  splitType: splitTypeSchema,
  members: z.array(z.object({
    id: userIdSchema,
    name: z.string().min(1),
  })).min(1),
  customAmounts: z.record(z.string(), z.number().min(0)).optional(),
  customPercentages: z.record(z.string(), z.number().min(0).max(100)).optional(),
});

export const updateExpenseFormSchema = createExpenseFormSchema.partial();

export const createGroupFormSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  currency: currencySchema,
});

export const updateGroupFormSchema = createGroupFormSchema.partial();

// Funciones de validación helper
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (password.length > 100) {
    errors.push('La contraseña es demasiado larga');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCurrency(currency: string): currency is Currency {
  return isSupportedCurrency(currency);
}

export function validateAmount(amount: number, currency: Currency): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (amount <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }
  
  if (amount > 999999.99) {
    errors.push('El monto es demasiado alto');
  }
  
  // Validar decimales según la moneda
  const decimals = ['CLP', 'COP'].includes(currency) ? 0 : 2;
  const factor = Math.pow(10, decimals);
  
  if (Math.round(amount * factor) !== amount * factor) {
    errors.push(`La moneda ${currency} ${decimals === 0 ? 'no permite' : 'requiere máximo ' + decimals} decimales`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Tipo helper para extraer tipos de los esquemas
export type CreateExpenseForm = z.infer<typeof createExpenseFormSchema>;
export type UpdateExpenseForm = z.infer<typeof updateExpenseFormSchema>;
export type CreateGroupForm = z.infer<typeof createGroupFormSchema>;
export type UpdateGroupForm = z.infer<typeof updateGroupFormSchema>;
