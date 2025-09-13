import app from './app.js';
import { logger } from '@/lib/logger.js';
import { prisma } from '@/lib/prisma.js';
import { redis } from '@/lib/redis.js';

/**
 * Servidor principal de la API
 * Inicializa conexiones y arranca el servidor
 */

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Inicializar conexiones y servicios
 */
async function initializeServices() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    logger.info('✅ Conectado a PostgreSQL');

    // Conectar a Redis
    await redis.connect();
    logger.info('✅ Conectado a Redis');

    return true;
  } catch (error) {
    logger.error('❌ Error al inicializar servicios:', error);
    return false;
  }
}

/**
 * Iniciar el servidor
 */
async function startServer() {
  try {
    // Inicializar servicios
    const servicesReady = await initializeServices();
    
    if (!servicesReady) {
      logger.error('❌ No se pudieron inicializar todos los servicios');
      process.exit(1);
    }

    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Servidor Partio API iniciado`);
      logger.info(`📍 URL: http://localhost:${PORT}`);
      logger.info(`🌍 Entorno: ${NODE_ENV}`);
      logger.info(`📚 Documentación: http://localhost:${PORT}/api-docs`);
      logger.info(`❤️  Health check: http://localhost:${PORT}/health`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📡 Señal ${signal} recibida, cerrando servidor...`);
      
      server.close(async () => {
        logger.info('🔌 Servidor HTTP cerrado');
        
        try {
          await prisma.$disconnect();
          logger.info('🔌 Desconectado de PostgreSQL');
          
          await redis.disconnect();
          logger.info('🔌 Desconectado de Redis');
          
          logger.info('✅ Cierre graceful completado');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error durante el cierre:', error);
          process.exit(1);
        }
      });
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar la aplicación
startServer();