/**
 * Tipos compartidos para el core de Partio
 * Definiciones de tipos que se usan en toda la aplicación
 */

export type Currency = 'USD' | 'EUR' | 'ARS' | 'BRL' | 'CLP' | 'COP' | 'MXN' | 'PEN' | 'UYU';

export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface ExpenseMember {
  id: string;
  name: string;
  email?: string;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  type: SplitType;
  percentage?: number; // Solo para tipo PERCENTAGE
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: Currency;
  creatorId: string;
  splits: ExpenseSplit[];
  date: Date;
}

export interface GroupBalance {
  userId: string;
  userName: string;
  balance: number; // positivo = le deben, negativo = debe
}

export interface Settlement {
  payerId: string;
  receiverId: string;
  amount: number;
  currency: Currency;
}

export interface CurrencyRate {
  from: Currency;
  to: Currency;
  rate: number;
  date: Date;
}

// Tipos para validación
export interface SplitCalculationInput {
  totalAmount: number;
  currency: Currency;
  members: ExpenseMember[];
  splitType: SplitType;
  customSplits?: Array<{
    userId: string;
    amount?: number;
    percentage?: number;
  }>;
}

export interface SplitCalculationResult {
  splits: ExpenseSplit[];
  totalAllocated: number;
  remainder: number;
}

// Errores personalizados
export class PartioError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'PartioError';
  }
}

export class ValidationError extends PartioError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class CalculationError extends PartioError {
  constructor(message: string) {
    super(message, 'CALCULATION_ERROR', 400);
    this.name = 'CalculationError';
  }
}
