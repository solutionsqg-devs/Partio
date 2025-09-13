import { Response } from 'express';
import { AuthService } from '@/services/auth.service.js';
import { AuthenticatedRequest, ApiResponse } from '@/types/index.js';
import { asyncHandler } from '@/middlewares/error.middleware.js';
import { logger } from '@/lib/logger.js';

/**
 * Controlador de autenticación
 * Maneja las peticiones HTTP relacionadas con auth
 */
export class AuthController {
  /**
   * Registrar nuevo usuario
   * POST /auth/signup
   */
  static signup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password, name } = req.body;

    const result = await AuthService.signup({
      email,
      password,
      name,
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Usuario registrado exitosamente',
    };

    logger.info('Signup exitoso', {
      userId: result.user.id,
      email: result.user.email,
      ip: req.ip,
    });

    res.status(201).json(response);
  });

  /**
   * Iniciar sesión
   * POST /auth/signin
   */
  static signin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.signin({
      email,
      password,
    });

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Sesión iniciada exitosamente',
    };

    logger.info('Signin exitoso', {
      userId: result.user.id,
      email: result.user.email,
      ip: req.ip,
    });

    res.status(200).json(response);
  });

  /**
   * Obtener perfil del usuario autenticado
   * GET /auth/profile
   */
  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await AuthService.getProfile(userId);

    const response: ApiResponse = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  });

  /**
   * Actualizar perfil del usuario
   * PUT /auth/profile
   */
  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { name, avatar } = req.body;

    const user = await AuthService.updateProfile(userId, {
      name,
      avatar,
    });

    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'Perfil actualizado exitosamente',
    };

    res.status(200).json(response);
  });

  /**
   * Cambiar contraseña
   * PUT /auth/password
   */
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    await AuthService.changePassword(userId, {
      currentPassword,
      newPassword,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Contraseña cambiada exitosamente',
    };

    logger.info('Contraseña cambiada', {
      userId,
      ip: req.ip,
    });

    res.status(200).json(response);
  });

  /**
   * Cerrar sesión (logout)
   * POST /auth/logout
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // En un sistema JWT stateless, el logout se maneja en el cliente
    // Aquí podríamos agregar el token a una blacklist en Redis si fuera necesario
    
    const response: ApiResponse = {
      success: true,
      message: 'Sesión cerrada exitosamente',
    };

    logger.info('Logout exitoso', {
      userId: req.user?.id,
      ip: req.ip,
    });

    res.status(200).json(response);
  });
}
