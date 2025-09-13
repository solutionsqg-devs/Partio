/**
 * Configuración global para tests
 * Se ejecuta antes de cada test suite
 */

import { prisma } from '@/lib/prisma.js';

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/partio_test';

// Timeout global para tests
jest.setTimeout(10000);

// Limpiar base de datos antes de cada test suite
beforeAll(async () => {
  // Conectar a la base de datos de test
  await prisma.$connect();
});

// Limpiar datos después de cada test
afterEach(async () => {
  // Limpiar todas las tablas en orden correcto (respetando foreign keys)
  await prisma.settlement.deleteMany();
  await prisma.expenseSplit.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
  await prisma.currencyRate.deleteMany();
});

// Cerrar conexión después de todos los tests
afterAll(async () => {
  await prisma.$disconnect();
});
