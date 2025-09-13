import { prisma } from '@/lib/prisma.js';
import { Group, GroupMember, User, Expense, ExpenseSplit } from '@prisma/client';
import { GroupBalance } from '@/types/index.js';

/**
 * Repository para operaciones de grupos
 * Abstrae el acceso a datos siguiendo Clean Architecture
 */
export class GroupsRepository {
  /**
   * Crear un nuevo grupo
   */
  async create(data: {
    name: string;
    description?: string;
    currency: string;
    ownerId: string;
  }): Promise<Group> {
    return await prisma.group.create({
      data,
    });
  }

  /**
   * Buscar grupo por ID con relaciones
   */
  async findById(id: string, includeMembers = true): Promise<Group & {
    owner: User;
    members?: (GroupMember & { user: User })[];
  } | null> {
    return await prisma.group.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: includeMembers ? {
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
        } : false,
      },
    });
  }

  /**
   * Obtener grupos donde el usuario es miembro
   */
  async findByUserId(userId: string): Promise<(Group & {
    owner: User;
    _count: { members: number; expenses: number };
  })[]> {
    return await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            expenses: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Agregar miembro al grupo
   */
  async addMember(groupId: string, userId: string, role: 'MEMBER' | 'ADMIN' = 'MEMBER'): Promise<GroupMember> {
    return await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role,
      },
    });
  }

  /**
   * Verificar si el usuario es miembro del grupo
   */
  async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
    return member?.status === 'ACTIVE';
  }

  /**
   * Verificar si el usuario es owner o admin del grupo
   */
  async isOwnerOrAdmin(groupId: string, userId: string): Promise<boolean> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { ownerId: true },
    });

    if (group?.ownerId === userId) {
      return true;
    }

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return member?.role === 'ADMIN';
  }

  /**
   * Calcular balances del grupo
   * Balance positivo = le deben dinero
   * Balance negativo = debe dinero
   */
  async calculateBalances(groupId: string): Promise<GroupBalance[]> {
    // Obtener todos los gastos del grupo con sus splits
    const expenses = await prisma.expense.findMany({
      where: { 
        groupId,
        status: 'ACTIVE',
      },
      include: {
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Mapa para acumular balances por usuario
    const balances = new Map<string, { userName: string; paid: number; owes: number }>();

    // Inicializar balances para todos los miembros del grupo
    const members = await prisma.groupMember.findMany({
      where: { 
        groupId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    members.forEach(member => {
      balances.set(member.userId, {
        userName: member.user.name,
        paid: 0,
        owes: 0,
      });
    });

    // Calcular lo que cada usuario pagó y debe
    expenses.forEach(expense => {
      const creatorId = expense.creatorId;
      const totalAmount = Number(expense.amount);

      // El creador pagó el total del gasto
      const creatorBalance = balances.get(creatorId);
      if (creatorBalance) {
        creatorBalance.paid += totalAmount;
      }

      // Cada usuario debe su parte del split
      expense.splits.forEach(split => {
        const userBalance = balances.get(split.userId);
        if (userBalance) {
          userBalance.owes += Number(split.amount);
        }
      });
    });

    // Convertir a formato de respuesta
    return Array.from(balances.entries()).map(([userId, data]) => ({
      userId,
      userName: data.userName,
      balance: data.paid - data.owes, // positivo = le deben, negativo = debe
    }));
  }

  /**
   * Actualizar grupo
   */
  async update(id: string, data: {
    name?: string;
    description?: string;
    currency?: string;
  }): Promise<Group> {
    return await prisma.group.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar grupo (solo owner)
   */
  async delete(id: string): Promise<void> {
    await prisma.group.delete({
      where: { id },
    });
  }
}
