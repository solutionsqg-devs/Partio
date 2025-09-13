import { Router, type Router as ExpressRouter } from 'express';
import { ExpensesController } from '@/controllers/expenses.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { validate } from '@/middlewares/validation.middleware.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseParamsSchema,
  groupExpensesParamsSchema,
} from '@/schemas/expenses.schemas.js';

const router: ExpressRouter = Router();

/**
 * Rutas de gastos
 * Todas las rutas requieren autenticación
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de gastos individuales
router.get('/:id', validate(expenseParamsSchema), ExpensesController.getExpenseById);
router.put('/:id', validate(updateExpenseSchema), ExpensesController.updateExpense);
router.delete('/:id', validate(expenseParamsSchema), ExpensesController.deleteExpense);

export default router;
