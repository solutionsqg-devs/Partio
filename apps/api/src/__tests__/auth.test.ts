import request from 'supertest';
import app from '@/app.js';
import { prisma } from '@/lib/prisma.js';

/**
 * Tests de integración para autenticación
 * Verifica el flujo completo signup -> signin
 */

describe('Auth Integration Tests', () => {
  const testUser = {
    email: 'test@partio.com',
    password: 'password123',
    name: 'Test User',
  };

  describe('POST /auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({
          ...testUser,
          password: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      // Crear usuario primero
      await request(app)
        .post('/auth/signup')
        .send(testUser)
        .expect(201);

      // Intentar crear usuario con mismo email
      const response = await request(app)
        .post('/auth/signup')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('El email ya está registrado');
    });
  });

  describe('POST /auth/signin', () => {
    beforeEach(async () => {
      // Crear usuario para tests de signin
      await request(app)
        .post('/auth/signup')
        .send(testUser);
    });

    it('should sign in user successfully', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'nonexistent@partio.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('GET /auth/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send(testUser);
      
      authToken = signupResponse.body.data.accessToken;
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
    });

    it('should fail without auth token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token de acceso requerido');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token inválido');
    });
  });
});
