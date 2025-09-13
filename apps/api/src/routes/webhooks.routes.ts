import { Router, Request, Response, type Router as ExpressRouter } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware.js';
import { logger } from '@/lib/logger.js';
import crypto from 'crypto';

const router: ExpressRouter = Router();

/**
 * Rutas de webhooks
 * Para integraciones con servicios de pago externos
 */

/**
 * Webhook de MercadoPago
 * POST /webhooks/mercadopago
 */
router.post('/mercadopago', asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['x-signature'] as string;
  const body = JSON.stringify(req.body);
  
  // Validar firma del webhook (ejemplo básico)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET || 'default-secret')
    .update(body)
    .digest('hex');

  if (signature !== `sha256=${expectedSignature}`) {
    logger.warn('Webhook MercadoPago con firma inválida', {
      signature,
      expectedSignature,
      ip: req.ip,
    });
    
    res.status(401).json({
      success: false,
      error: 'Firma inválida',
    });
    return;
  }

  // Procesar evento del webhook
  const { type, data } = req.body;
  
  logger.info('Webhook MercadoPago recibido', {
    type,
    dataId: data?.id,
    ip: req.ip,
  });

  // Aquí iría la lógica específica según el tipo de evento
  switch (type) {
    case 'payment':
      // Manejar evento de pago
      logger.info('Procesando pago de MercadoPago', { paymentId: data.id });
      break;
    
    case 'merchant_order':
      // Manejar orden de comerciante
      logger.info('Procesando orden de MercadoPago', { orderId: data.id });
      break;
    
    default:
      logger.warn('Tipo de evento no manejado', { type });
  }

  // Responder con 200 para confirmar recepción
  res.status(200).json({
    success: true,
    message: 'Webhook procesado',
  });
}));

/**
 * Webhook de Stripe
 * POST /webhooks/stripe
 */
router.post('/stripe', asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const body = JSON.stringify(req.body);
  
  // En una implementación real, usar stripe.webhooks.constructEvent()
  // para validar la firma del webhook
  
  logger.info('Webhook Stripe recibido', {
    type: req.body.type,
    id: req.body.id,
    ip: req.ip,
  });

  // Procesar evento según el tipo
  const { type, data } = req.body;
  
  switch (type) {
    case 'payment_intent.succeeded':
      logger.info('Pago exitoso en Stripe', { paymentIntentId: data.object.id });
      break;
    
    case 'payment_intent.payment_failed':
      logger.info('Pago fallido en Stripe', { paymentIntentId: data.object.id });
      break;
    
    default:
      logger.warn('Tipo de evento Stripe no manejado', { type });
  }

  res.status(200).json({
    success: true,
    message: 'Webhook procesado',
  });
}));

/**
 * Webhook genérico para testing
 * POST /webhooks/test
 */
router.post('/test', asyncHandler(async (req: Request, res: Response) => {
  logger.info('Webhook de test recibido', {
    body: req.body,
    headers: req.headers,
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: 'Webhook de test procesado',
    received: req.body,
  });
}));

export default router;
