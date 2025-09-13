import { Response } from 'express';
import { GroupsService } from '@/services/groups.service.js';
import { AuthenticatedRequest, ApiResponse } from '@/types/index.js';
import { asyncHandler } from '@/middlewares/error.middleware.js';

/**
 * Controlador de grupos
 * Maneja las peticiones HTTP relacionadas con grupos
 */
export class GroupsController {
  /**
   * Crear un nuevo grupo
   * POST /groups
   */
  static createGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { name, description, currency } = req.body;

    const group = await GroupsService.createGroup(userId, {
      name,
      description,
      currency,
    });

    const response: ApiResponse = {
      success: true,
      data: group,
      message: 'Grupo creado exitosamente',
    };

    res.status(201).json(response);
  });

  /**
   * Obtener grupos del usuario
   * GET /groups
   */
  static getUserGroups = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const groups = await GroupsService.getUserGroups(userId);

    const response: ApiResponse = {
      success: true,
      data: groups,
    };

    res.status(200).json(response);
  });

  /**
   * Obtener detalle de un grupo
   * GET /groups/:id
   */
  static getGroupById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: groupId } = req.params;

    const group = await GroupsService.getGroupById(groupId, userId);

    const response: ApiResponse = {
      success: true,
      data: group,
    };

    res.status(200).json(response);
  });

  /**
   * Actualizar grupo
   * PUT /groups/:id
   */
  static updateGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: groupId } = req.params;
    const { name, description, currency } = req.body;

    const group = await GroupsService.updateGroup(groupId, userId, {
      name,
      description,
      currency,
    });

    const response: ApiResponse = {
      success: true,
      data: group,
      message: 'Grupo actualizado exitosamente',
    };

    res.status(200).json(response);
  });

  /**
   * Eliminar grupo
   * DELETE /groups/:id
   */
  static deleteGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: groupId } = req.params;

    await GroupsService.deleteGroup(groupId, userId);

    const response: ApiResponse = {
      success: true,
      message: 'Grupo eliminado exitosamente',
    };

    res.status(200).json(response);
  });

  /**
   * Agregar miembro al grupo
   * POST /groups/:id/members
   */
  static addMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: groupId } = req.params;
    const { email } = req.body;

    const member = await GroupsService.addMember(groupId, userId, email);

    const response: ApiResponse = {
      success: true,
      data: member,
      message: 'Miembro agregado exitosamente',
    };

    res.status(201).json(response);
  });

  /**
   * Obtener sugerencias de liquidación
   * GET /groups/:id/settlements
   */
  static getSettlementSuggestions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { id: groupId } = req.params;

    const suggestions = await GroupsService.getSettlementSuggestions(groupId, userId);

    const response: ApiResponse = {
      success: true,
      data: suggestions,
    };

    res.status(200).json(response);
  });
}
