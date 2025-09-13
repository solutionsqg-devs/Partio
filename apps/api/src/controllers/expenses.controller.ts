import { Response } from 'express';
import { ExpensesService } from '@/services/expenses.service.js';
import { AuthenticatedRequest, ApiResponse } from '@/types/index.js';
import { asyncHandler } from '@/middlewares/error.middleware.js';

/**
 * Controlador de gastos
 * Maneja las peticiones HTTP relacionadas con gastos
 */
export class ExpensesController {
  /**
   * Crear un nuevo gasto
   * POST /groups/:groupId/expenses
   */
  static createExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const { title, description, amount, currency, category, splits } = req.body;

    const expense = await ExpensesService.createExpense(userId, {
      title,
      description,
      amount,
      currency,
      category,
      groupId,
      splits,
    });

    const response: ApiResponse = {
      success: true,
      data: expense,
      message: 'Gasto creado exitosamente',
    };

    res.status(201).json(response);
  });

  /**
   * Obtener gastos de un grupo
   * GET /groups/:groupId/expenses
   */
  static getGroupExpenses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await ExpensesService.getGroupExpenses(groupId, userId, page, limit);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  });

  /**
   * Obtener detalle de un gasto
   * GET /expenses/:id
   */
  static getExpenseById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: expenseId } = req.params;

    const expense = await ExpensesService.getExpenseById(expenseId, userId);

    const response: ApiResponse = {
      success: true,
      data: expense,
    };

    res.status(200).json(response);
  });

  /**
   * Actualizar un gasto
   * PUT /expenses/:id
   */
  static updateExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: expenseId } = req.params;
    const { title, description, amount, currency, category, splits } = req.body;

    const expense = await ExpensesService.updateExpense(expenseId, userId, {
      title,
      description,
      amount,
      currency,
      category,
      splits,
    });

    const response: ApiResponse = {
      success: true,
      data: expense,
      message: 'Gasto actualizado exitosamente',
    };

    res.status(200).json(response);
  });

  /**
   * Eliminar un gasto
   * DELETE /expenses/:id
   */
  static deleteExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: expenseId } = req.params;

    await ExpensesService.deleteExpense(expenseId, userId);

    const response: ApiResponse = {
      success: true,
      message: 'Gasto eliminado exitosamente',
    };

    res.status(200).json(response);
  });

  /**
   * Obtener gastos del usuario en un grupo
   * GET /groups/:groupId/expenses/me
   */
  static getUserExpensesInGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await ExpensesService.getUserExpensesInGroup(userId, groupId, page, limit);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  });
}
