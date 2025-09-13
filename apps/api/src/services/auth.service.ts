import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma.js';
import { User } from '@prisma/client';
import { createAppError } from '@/middlewares/error.middleware.js';
import { logger } from '@/lib/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthTokens {
  accessToken: string;
  user: Omit<User, 'password'>;
}

/**
 * Servicio de autenticación
 * Maneja registro, login y validación de usuarios
 */
export class AuthService {
  /**
   * Registrar nuevo usuario
   */
  static async signup(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthTokens> {
    const { email, password, name } = data;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw createAppError('El email ya está registrado', 409);
    }

    // Validar fortaleza de contraseña
    if (password.length < 6) {
      throw createAppError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generar token JWT
    const accessToken = this.generateToken(user.id, user.email);

    logger.info('Usuario registrado exitosamente', {
      userId: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user,
    };
  }

  /**
   * Iniciar sesión
   */
  static async signin(data: {
    email: string;
    password: string;
  }): Promise<AuthTokens> {
    const { email, password } = data;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw createAppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createAppError('Credenciales inválidas', 401);
    }

    // Generar token JWT
    const accessToken = this.generateToken(user.id, user.email);

    logger.info('Usuario inició sesión exitosamente', {
      userId: user.id,
      email: user.email,
    });

    // Retornar datos sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  /**
   * Obtener perfil de usuario
   */
  static async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createAppError('Usuario no encontrado', 404);
    }

    return user;
  }

  /**
   * Actualizar perfil de usuario
   */
  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatar?: string;
    }
  ): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name?.trim(),
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Perfil de usuario actualizado', {
      userId: user.id,
    });

    return user;
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(
    userId: string,
    data: {
      currentPassword: string;
      newPassword: string;
    }
  ): Promise<void> {
    const { currentPassword, newPassword } = data;

    // Buscar usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createAppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw createAppError('Contraseña actual incorrecta', 400);
    }

    // Validar nueva contraseña
    if (newPassword.length < 6) {
      throw createAppError('La nueva contraseña debe tener al menos 6 caracteres', 400);
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    logger.info('Contraseña cambiada exitosamente', {
      userId: user.id,
    });
  }

  /**
   * Generar token JWT
   */
  private static generateToken(userId: string, email: string): string {
    return jwt.sign(
      {
        userId,
        email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
  }

  /**
   * Verificar token JWT
   */
  static verifyToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      throw createAppError('Token inválido', 401);
    }
  }
}
