import { ExpensesRepository } from '@/repositories/expenses.repository.js';
import { GroupsRepository } from '@/repositories/groups.repository.js';
import { createAppError } from '@/middlewares/error.middleware.js';
import { logger } from '@/lib/logger.js';
import { CacheService } from '@/lib/redis.js';
import { Expense, ExpenseSplit, User } from '@prisma/client';
import { ExpenseSplitCalculation, PaginatedResponse } from '@/types/index.js';

/**
 * Servicio de gastos
 * Contiene la lógica de negocio para manejo de gastos y sus divisiones
 */
export class ExpensesService {
  private static expensesRepository = new ExpensesRepository();
  private static groupsRepository = new GroupsRepository();

  /**
   * Crear un nuevo gasto
   */
  static async createExpense(
    userId: string,
    data: {
      title: string;
      description?: string;
      amount: number;
      currency?: string;
      category?: string;
      groupId: string;
      splits: ExpenseSplitCalculation[];
    }
  ): Promise<Expense & { splits: (ExpenseSplit & { user: User })[] }> {
    const { title, description, amount, currency = 'USD', category, groupId, splits } = data;

    // Verificar que el usuario es miembro del grupo
    const isMember = await this.groupsRepository.isMember(groupId, userId);
    if (!isMember) {
      throw createAppError('No tienes acceso a este grupo', 403);
    }

    // Validaciones de negocio
    if (title.trim().length < 2) {
      throw createAppError('El título del gasto debe tener al menos 2 caracteres', 400);
    }

    if (amount <= 0) {
      throw createAppError('El monto debe ser mayor a 0', 400);
    }

    if (splits.length === 0) {
      throw createAppError('Debe haber al menos un participante en el gasto', 400);
    }

    // Verificar que todos los usuarios en splits son miembros del grupo
    for (const split of splits) {
      const isSplitUserMember = await this.groupsRepository.isMember(groupId, split.userId);
      if (!isSplitUserMember) {
        throw createAppError(`El usuario ${split.userId} no es miembro del grupo`, 400);
      }
    }

    // Validar que la suma de splits coincide con el monto total
    const totalSplits = splits.reduce((sum, split) => sum + split.amount, 0);
    const tolerance = 0.01; // Tolerancia para errores de redondeo
    
    if (Math.abs(totalSplits - amount) > tolerance) {
      throw createAppError(
        `La suma de las divisiones (${totalSplits}) no coincide con el monto total (${amount})`,
        400
      );
    }

    // Crear el gasto
    const expense = await this.expensesRepository.create({
      title: title.trim(),
      description: description?.trim(),
      amount,
      currency,
      category: category?.trim(),
      groupId,
      creatorId: userId,
      splits,
    });

    // Invalidar caches relacionados
    await Promise.all([
      CacheService.invalidatePattern(`group:${groupId}:*`),
      CacheService.invalidatePattern(`expenses:group:${groupId}:*`),
    ]);

    logger.info('Gasto creado exitosamente', {
      expenseId: expense.id,
      groupId,
      creatorId: userId,
      amount,
      currency,
    });

    return expense;
  }

  /**
   * Obtener gastos de un grupo con paginación
   */
  static async getGroupExpenses(
    groupId: string,
    userId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Expense & {
    creator: User;
    splits: (ExpenseSplit & { user: User })[];
  }>> {
    // Verificar acceso al grupo
    const isMember = await this.groupsRepository.isMember(groupId, userId);
    if (!isMember) {
      throw createAppError('No tienes acceso a este grupo', 403);
    }

    const cacheKey = `expenses:group:${groupId}:page:${page}:limit:${limit}`;
    
    // Intentar obtener del cache
    const cached = await CacheService.get<PaginatedResponse<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Obtener gastos de la base de datos
    const { expenses, total } = await this.expensesRepository.findByGroupId(groupId, page, limit);

    const result: PaginatedResponse<any> = {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Guardar en cache por 2 minutos
    await CacheService.set(cacheKey, result, 120);

    return result;
  }

  /**
   * Obtener detalle de un gasto
   */
  static async getExpenseById(
    expenseId: string,
    userId: string
  ): Promise<Expense & {
    creator: User;
    splits: (ExpenseSplit & { user: User })[];
    group: { id: string; name: string };
  }> {
    const expense = await this.expensesRepository.findById(expenseId);
    
    if (!expense) {
      throw createAppError('Gasto no encontrado', 404);
    }

    // Verificar que el usuario tiene acceso al grupo del gasto
    const isMember = await this.groupsRepository.isMember(expense.groupId, userId);
    if (!isMember) {
      throw createAppError('No tienes acceso a este gasto', 403);
    }

    return expense;
  }

  /**
   * Actualizar un gasto
   */
  static async updateExpense(
    expenseId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      amount?: number;
      currency?: string;
      category?: string;
      splits?: ExpenseSplitCalculation[];
    }
  ): Promise<Expense> {
    // Verificar que el usuario puede editar el gasto
    const canEdit = await this.expensesRepository.canUserEdit(expenseId, userId);
    if (!canEdit) {
      throw createAppError('No tienes permisos para editar este gasto', 403);
    }

    // Obtener gasto actual para validaciones
    const currentExpense = await this.expensesRepository.findById(expenseId);
    if (!currentExpense) {
      throw createAppError('Gasto no encontrado', 404);
    }

    // Validaciones
    if (data.title && data.title.trim().length < 2) {
      throw createAppError('El título del gasto debe tener al menos 2 caracteres', 400);
    }

    if (data.amount && data.amount <= 0) {
      throw createAppError('El monto debe ser mayor a 0', 400);
    }

    // Si se actualizan los splits, validar
    if (data.splits) {
      if (data.splits.length === 0) {
        throw createAppError('Debe haber al menos un participante en el gasto', 400);
      }

      // Verificar que todos los usuarios son miembros del grupo
      for (const split of data.splits) {
        const isMember = await this.groupsRepository.isMember(currentExpense.groupId, split.userId);
        if (!isMember) {
          throw createAppError(`El usuario ${split.userId} no es miembro del grupo`, 400);
        }
      }

      // Validar suma de splits
      const amount = data.amount || Number(currentExpense.amount);
      const totalSplits = data.splits.reduce((sum, split) => sum + split.amount, 0);
      const tolerance = 0.01;
      
      if (Math.abs(totalSplits - amount) > tolerance) {
        throw createAppError(
          `La suma de las divisiones (${totalSplits}) no coincide con el monto total (${amount})`,
          400
        );
      }
    }

    // Actualizar gasto
    const updatedExpense = await this.expensesRepository.update(expenseId, {
      title: data.title?.trim(),
      description: data.description?.trim(),
      amount: data.amount,
      currency: data.currency,
      category: data.category?.trim(),
      splits: data.splits,
    });

    // Invalidar caches
    await Promise.all([
      CacheService.invalidatePattern(`group:${currentExpense.groupId}:*`),
      CacheService.invalidatePattern(`expenses:group:${currentExpense.groupId}:*`),
    ]);

    logger.info('Gasto actualizado', {
      expenseId,
      updatedBy: userId,
    });

    return updatedExpense;
  }

  /**
   * Eliminar un gasto
   */
  static async deleteExpense(expenseId: string, userId: string): Promise<void> {
    // Verificar que el usuario puede editar el gasto
    const canEdit = await this.expensesRepository.canUserEdit(expenseId, userId);
    if (!canEdit) {
      throw createAppError('No tienes permisos para eliminar este gasto', 403);
    }

    // Obtener gasto para invalidar caches
    const expense = await this.expensesRepository.findById(expenseId);
    if (!expense) {
      throw createAppError('Gasto no encontrado', 404);
    }

    // Eliminar gasto (soft delete)
    await this.expensesRepository.delete(expenseId);

    // Invalidar caches
    await Promise.all([
      CacheService.invalidatePattern(`group:${expense.groupId}:*`),
      CacheService.invalidatePattern(`expenses:group:${expense.groupId}:*`),
    ]);

    logger.info('Gasto eliminado', {
      expenseId,
      deletedBy: userId,
    });
  }

  /**
   * Obtener gastos de un usuario en un grupo específico
   */
  static async getUserExpensesInGroup(
    userId: string,
    groupId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Expense & {
    creator: User;
    splits: (ExpenseSplit & { user: User })[];
  }>> {
    // Verificar acceso al grupo
    const isMember = await this.groupsRepository.isMember(groupId, userId);
    if (!isMember) {
      throw createAppError('No tienes acceso a este grupo', 403);
    }

    const { expenses, total } = await this.expensesRepository.findByUserAndGroup(
      userId,
      groupId,
      page,
      limit
    );

    return {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
