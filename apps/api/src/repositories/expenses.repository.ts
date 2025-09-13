import { prisma } from '@/lib/prisma.js';
import { Expense, ExpenseSplit, User } from '@prisma/client';
import { ExpenseSplitCalculation } from '@/types/index.js';

/**
 * Repository para operaciones de gastos
 * Maneja la persistencia de gastos y sus divisiones
 */
export class ExpensesRepository {
  /**
   * Crear un nuevo gasto con sus splits
   */
  async create(data: {
    title: string;
    description?: string;
    amount: number;
    currency: string;
    category?: string;
    groupId: string;
    creatorId: string;
    splits: ExpenseSplitCalculation[];
  }): Promise<Expense & { splits: (ExpenseSplit & { user: User })[] }> {
    return await prisma.expense.create({
      data: {
        title: data.title,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        groupId: data.groupId,
        creatorId: data.creatorId,
        splits: {
          create: data.splits.map(split => ({
            userId: split.userId,
            amount: split.amount,
            type: split.type,
          })),
        },
      },
      include: {
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Buscar gasto por ID
   */
  async findById(id: string): Promise<Expense & {
    creator: User;
    splits: (ExpenseSplit & { user: User })[];
    group: { id: string; name: string };
  } | null> {
    return await prisma.expense.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Obtener gastos de un grupo con paginación
   */
  async findByGroupId(
    groupId: string,
    page = 1,
    limit = 20
  ): Promise<{
    expenses: (Expense & {
      creator: User;
      splits: (ExpenseSplit & { user: User })[];
    })[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: { 
          groupId,
          status: 'ACTIVE',
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.expense.count({
        where: { 
          groupId,
          status: 'ACTIVE',
        },
      }),
    ]);

    return { expenses, total };
  }

  /**
   * Obtener gastos de un usuario en un grupo específico
   */
  async findByUserAndGroup(
    userId: string,
    groupId: string,
    page = 1,
    limit = 20
  ): Promise<{
    expenses: (Expense & {
      creator: User;
      splits: (ExpenseSplit & { user: User })[];
    })[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where: {
          groupId,
          status: 'ACTIVE',
          OR: [
            { creatorId: userId },
            {
              splits: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.expense.count({
        where: {
          groupId,
          status: 'ACTIVE',
          OR: [
            { creatorId: userId },
            {
              splits: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
      }),
    ]);

    return { expenses, total };
  }

  /**
   * Actualizar gasto
   */
  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      amount?: number;
      currency?: string;
      category?: string;
      splits?: ExpenseSplitCalculation[];
    }
  ): Promise<Expense> {
    const updateData: any = {
      title: data.title,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
    };

    // Si se actualizan los splits, eliminar los existentes y crear nuevos
    if (data.splits) {
      updateData.splits = {
        deleteMany: {},
        create: data.splits.map(split => ({
          userId: split.userId,
          amount: split.amount,
          type: split.type,
        })),
      };
    }

    return await prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Eliminar gasto (soft delete)
   */
  async delete(id: string): Promise<void> {
    await prisma.expense.update({
      where: { id },
      data: {
        status: 'DELETED',
      },
    });
  }

  /**
   * Verificar si el usuario puede editar el gasto
   */
  async canUserEdit(expenseId: string, userId: string): Promise<boolean> {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      select: {
        creatorId: true,
        group: {
          select: {
            ownerId: true,
            members: {
              where: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        },
      },
    });

    if (!expense) return false;

    // Puede editar si es el creador, owner del grupo, o admin del grupo
    return (
      expense.creatorId === userId ||
      expense.group.ownerId === userId ||
      expense.group.members.length > 0
    );
  }
}
