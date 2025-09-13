/**
 * Tipos para variables de entorno
 * Proporciona type safety para process.env
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Base de datos
    DATABASE_URL: string;
    
    // Redis
    REDIS_URL: string;
    
    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    
    // Servidor
    PORT: string;
    NODE_ENV: 'development' | 'production' | 'test';
    
    // CORS
    CORS_ORIGIN: string;
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX_REQUESTS: string;
    
    // Logging
    LOG_LEVEL: string;
    
    // Webhooks
    MERCADOPAGO_WEBHOOK_SECRET: string;
    STRIPE_WEBHOOK_SECRET: string;
  }
}
