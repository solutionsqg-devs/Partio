import { GroupsRepository } from '@/repositories/groups.repository.js';
import { createAppError } from '@/middlewares/error.middleware.js';
import { logger } from '@/lib/logger.js';
import { CacheService } from '@/lib/redis.js';
import { Group, User, GroupMember } from '@prisma/client';
import { GroupBalance, SettlementSuggestion } from '@/types/index.js';

/**
 * Servicio de grupos
 * Contiene la lógica de negocio para manejo de grupos
 */
export class GroupsService {
  private static groupsRepository = new GroupsRepository();

  /**
   * Crear un nuevo grupo
   */
  static async createGroup(
    userId: string,
    data: {
      name: string;
      description?: string;
      currency?: string;
    }
  ): Promise<Group & { owner: User; members: (GroupMember & { user: User })[] }> {
    const { name, description, currency = 'USD' } = data;

    // Validaciones de negocio
    if (name.trim().length < 2) {
      throw createAppError('El nombre del grupo debe tener al menos 2 caracteres', 400);
    }

    // Crear grupo
    const group = await this.groupsRepository.create({
      name: name.trim(),
      description: description?.trim(),
      currency,
      ownerId: userId,
    });

    // Agregar al creador como miembro owner
    await this.groupsRepository.addMember(group.id, userId, 'MEMBER');

    // Obtener grupo completo con relaciones
    const fullGroup = await this.groupsRepository.findById(group.id);

    if (!fullGroup) {
      throw createAppError('Error al crear el grupo', 500);
    }

    // Invalidar cache de grupos del usuario
    await CacheService.invalidatePattern(`user:${userId}:groups*`);

    logger.info('Grupo creado exitosamente', {
      groupId: group.id,
      ownerId: userId,
      name: group.name,
    });

    return fullGroup;
  }

  /**
   * Obtener grupos del usuario
   */
  static async getUserGroups(userId: string): Promise<(Group & {
    owner: User;
    _count: { members: number; expenses: number };
  })[]> {
    const cacheKey = `user:${userId}:groups`;
    
    // Intentar obtener del cache
    const cached = await CacheService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Obtener de la base de datos
    const groups = await this.groupsRepository.findByUserId(userId);

    // Guardar en cache por 5 minutos
    await CacheService.set(cacheKey, groups, 300);

    return groups;
  }

  /**
   * Obtener detalle de un grupo
   */
  static async getGroupById(
    groupId: string,
    userId: string
  ): Promise<Group & {
    owner: User;
    members: (GroupMember & { user: User })[];
    balances: GroupBalance[];
  }> {
    // Verificar que el usuario es miembro del grupo
    const isMember = await this.groupsRepository.isMember(groupId, userId);
    if (!isMember) {
      throw createAppError('No tienes acceso a este grupo', 403);
    }

    const cacheKey = `group:${groupId}:detail`;
    
    // Intentar obtener del cache
    const cached = await CacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Obtener grupo de la base de datos
    const group = await this.groupsRepository.findById(groupId);
    if (!group) {
      throw createAppError('Grupo no encontrado', 404);
    }

    // Calcular balances
    const balances = await this.groupsRepository.calculateBalances(groupId);

    const result = {
      ...group,
      balances,
    };

    // Guardar en cache por 2 minutos
    await CacheService.set(cacheKey, result, 120);

    return result;
  }

  /**
   * Agregar miembro al grupo
   */
  static async addMember(
    groupId: string,
    userId: string,
    memberEmail: string
  ): Promise<GroupMember & { user: User }> {
    // Verificar que el usuario puede agregar miembros (owner o admin)
    const canAddMembers = await this.groupsRepository.isOwnerOrAdmin(groupId, userId);
    if (!canAddMembers) {
      throw createAppError('No tienes permisos para agregar miembros', 403);
    }

    // Buscar usuario por email
    const memberUser = await prisma.user.findUnique({
      where: { email: memberEmail.toLowerCase() },
    });

    if (!memberUser) {
      throw createAppError('Usuario no encontrado', 404);
    }

    // Verificar que no sea ya miembro
    const isAlreadyMember = await this.groupsRepository.isMember(groupId, memberUser.id);
    if (isAlreadyMember) {
      throw createAppError('El usuario ya es miembro del grupo', 409);
    }

    // Agregar miembro
    const member = await this.groupsRepository.addMember(groupId, memberUser.id);

    // Invalidar caches relacionados
    await Promise.all([
      CacheService.invalidatePattern(`group:${groupId}:*`),
      CacheService.invalidatePattern(`user:${memberUser.id}:groups*`),
    ]);

    logger.info('Miembro agregado al grupo', {
      groupId,
      memberId: memberUser.id,
      addedBy: userId,
    });

    return {
      ...member,
      user: memberUser,
    };
  }

  /**
   * Calcular sugerencias de liquidación
   * Algoritmo para minimizar el número de transacciones
   */
  static async getSettlementSuggestions(
    groupId: string,
    userId: string
  ): Promise<SettlementSuggestion[]> {
    // Verificar acceso al grupo
    const isMember = await this.groupsRepository.isMember(groupId, userId);
    if (!isMember) {
      throw createAppError('No tienes acceso a este grupo', 403);
    }

    const cacheKey = `group:${groupId}:settlements`;
    
    // Intentar obtener del cache
    const cached = await CacheService.get<SettlementSuggestion[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Obtener balances actuales
    const balances = await this.groupsRepository.calculateBalances(groupId);

    // Separar deudores y acreedores
    const debtors = balances.filter(b => b.balance < 0).map(b => ({
      userId: b.userId,
      amount: Math.abs(b.balance),
    }));

    const creditors = balances.filter(b => b.balance > 0).map(b => ({
      userId: b.userId,
      amount: b.balance,
    }));

    // Algoritmo de liquidación óptima
    const suggestions: SettlementSuggestion[] = [];
    
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]!;
      const creditor = creditors[j]!;

      const amount = Math.min(debtor.amount, creditor.amount);

      suggestions.push({
        payerId: debtor.userId,
        receiverId: creditor.userId,
        amount: Math.round(amount * 100) / 100, // Redondear a 2 decimales
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    // Guardar en cache por 1 minuto
    await CacheService.set(cacheKey, suggestions, 60);

    return suggestions;
  }

  /**
   * Actualizar grupo
   */
  static async updateGroup(
    groupId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
      currency?: string;
    }
  ): Promise<Group> {
    // Verificar permisos (solo owner o admin)
    const canUpdate = await this.groupsRepository.isOwnerOrAdmin(groupId, userId);
    if (!canUpdate) {
      throw createAppError('No tienes permisos para editar este grupo', 403);
    }

    // Validaciones
    if (data.name && data.name.trim().length < 2) {
      throw createAppError('El nombre del grupo debe tener al menos 2 caracteres', 400);
    }

    const updatedGroup = await this.groupsRepository.update(groupId, {
      name: data.name?.trim(),
      description: data.description?.trim(),
      currency: data.currency,
    });

    // Invalidar caches
    await CacheService.invalidatePattern(`group:${groupId}:*`);

    logger.info('Grupo actualizado', {
      groupId,
      updatedBy: userId,
    });

    return updatedGroup;
  }

  /**
   * Eliminar grupo
   */
  static async deleteGroup(groupId: string, userId: string): Promise<void> {
    // Verificar que es el owner del grupo
    const group = await this.groupsRepository.findById(groupId, false);
    if (!group) {
      throw createAppError('Grupo no encontrado', 404);
    }

    if (group.ownerId !== userId) {
      throw createAppError('Solo el propietario puede eliminar el grupo', 403);
    }

    // Verificar que no hay gastos pendientes
    const balances = await this.groupsRepository.calculateBalances(groupId);
    const hasOutstandingBalances = balances.some(b => Math.abs(b.balance) > 0.01);

    if (hasOutstandingBalances) {
      throw createAppError('No se puede eliminar el grupo con balances pendientes', 400);
    }

    await this.groupsRepository.delete(groupId);

    // Invalidar caches
    await CacheService.invalidatePattern(`group:${groupId}:*`);

    logger.info('Grupo eliminado', {
      groupId,
      deletedBy: userId,
    });
  }
}
