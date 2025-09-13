import { Router, type Router as ExpressRouter } from 'express';
import { GroupsController } from '@/controllers/groups.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { validate } from '@/middlewares/validation.middleware.js';
import {
  createGroupSchema,
  updateGroupSchema,
  groupParamsSchema,
  addMemberSchema,
} from '@/schemas/groups.schemas.js';

const router: ExpressRouter = Router();

/**
 * Rutas de grupos
 * Todas las rutas requieren autenticación
 */

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de grupos
router.post('/', validate(createGroupSchema), GroupsController.createGroup);
router.get('/', GroupsController.getUserGroups);
router.get('/:id', validate(groupParamsSchema), GroupsController.getGroupById);
router.put('/:id', validate({ ...updateGroupSchema, ...groupParamsSchema }), GroupsController.updateGroup);
router.delete('/:id', validate(groupParamsSchema), GroupsController.deleteGroup);

// Rutas de miembros
router.post('/:id/members', validate({ ...addMemberSchema, ...groupParamsSchema }), GroupsController.addMember);

// Rutas de liquidaciones
router.get('/:id/settlements', validate(groupParamsSchema), GroupsController.getSettlementSuggestions);

export default router;
