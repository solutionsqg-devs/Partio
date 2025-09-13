import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Importar rutas
import authRoutes from '@/routes/auth.routes.js';
import groupsRoutes from '@/routes/groups.routes.js';
import expensesRoutes from '@/routes/expenses.routes.js';
import webhooksRoutes from '@/routes/webhooks.routes.js';

// Importar middlewares
import { errorHandler, notFoundHandler } from '@/middlewares/error.middleware.js';
import { logger, morganStream } from '@/lib/logger.js';

// Importar controladores adicionales
import { ExpensesController } from '@/controllers/expenses.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { validate } from '@/middlewares/validation.middleware.js';
import { createExpenseSchema, groupExpensesParamsSchema } from '@/schemas/expenses.schemas.js';

/**
 * Configuración de la aplicación Express
 * Siguiendo principios de Clean Architecture y seguridad
 */

const app: express.Application = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes, intenta de nuevo más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests HTTP
app.use(morgan('combined', { stream: morganStream }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Endpoint de información de la API
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Partio API - SaaS de gastos compartidos',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/auth',
      groups: '/groups',
      expenses: '/expenses',
      webhooks: '/webhooks',
    },
  });
});

// Rutas de la API
app.use('/auth', authRoutes);
app.use('/groups', groupsRoutes);
app.use('/expenses', expensesRoutes);
app.use('/webhooks', webhooksRoutes);

// Rutas anidadas para gastos de grupos
app.use('/groups/:groupId/expenses', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  // Agregar groupId a los params para las rutas anidadas
  if (req.params.groupId) {
    req.params.groupId = req.params.groupId;
  }
  next();
});

// Crear gasto en un grupo específico
app.post('/groups/:groupId/expenses', 
  authMiddleware,
  validate({
    body: createExpenseSchema.shape.body,
    params: createExpenseSchema.shape.params
  }),
  ExpensesController.createExpense
);

// Obtener gastos de un grupo
app.get('/groups/:groupId/expenses',
  authMiddleware,
  validate({
    params: groupExpensesParamsSchema.shape.params,
    query: groupExpensesParamsSchema.shape.query
  }),
  ExpensesController.getGroupExpenses
);

// Obtener gastos del usuario en un grupo específico
app.get('/groups/:groupId/expenses/me',
  authMiddleware,
  validate({
    params: groupExpensesParamsSchema.shape.params,
    query: groupExpensesParamsSchema.shape.query
  }),
  ExpensesController.getUserExpensesInGroup
);

// Documentación de la API (Swagger)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api-docs', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Documentación de la API disponible en /openapi.yaml',
      swagger: 'Próximamente - Swagger UI',
    });
  });
}

// Middleware de manejo de rutas no encontradas
app.use(notFoundHandler);

// Middleware global de manejo de errores
app.use(errorHandler);

// Manejo de errores no capturados
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
