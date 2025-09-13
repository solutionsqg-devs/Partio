import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from '@/controllers/auth.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { validate } from '@/middlewares/validation.middleware.js';
import {
  signupSchema,
  signinSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '@/schemas/auth.schemas.js';

const router: ExpressRouter = Router();

/**
 * Rutas de autenticación
 * Maneja registro, login y gestión de perfil
 */

// Rutas públicas (sin autenticación)
router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/signin', validate(signinSchema), AuthController.signin);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware); // Aplicar middleware de auth a todas las rutas siguientes

router.get('/profile', AuthController.getProfile);
router.put('/profile', validate(updateProfileSchema), AuthController.updateProfile);
router.put('/password', validate(changePasswordSchema), AuthController.changePassword);
router.post('/logout', AuthController.logout);

export default router;
