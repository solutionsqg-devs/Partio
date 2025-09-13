import { Request } from 'express';
import { User } from '@prisma/client';

// Extender Request de Express para incluir usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// DTOs para API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para cálculos de gastos
export interface ExpenseSplitCalculation {
  userId: string;
  amount: number;
  type: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
}

export interface GroupBalance {
  userId: string;
  userName: string;
  balance: number; // positivo = le deben, negativo = debe
}

export interface SettlementSuggestion {
  payerId: string;
  receiverId: string;
  amount: number;
}

// Tipos para webhooks
export interface WebhookPayload {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}

// Configuración de rate limiting
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}
