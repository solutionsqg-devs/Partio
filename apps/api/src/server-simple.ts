import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares básicos
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Partio API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ El backend de Partio está corriendo correctamente',
    data: {
      features: [
        '🧮 Calculadora de splits',
        '💰 Manejo de múltiples monedas',
        '👥 Gestión de grupos',
        '📊 Balances automáticos',
        '🔐 Autenticación JWT',
      ],
    },
  });
});

// Endpoint para probar la calculadora de splits
app.post('/api/calculate-split', (req, res) => {
  try {
    const { amount, members, splitType = 'EQUAL' } = req.body;
    
    if (!amount || !members || !Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere amount y members (array)',
      });
    }

    // Simulación simple de división equitativa
    const splitAmount = amount / members.length;
    const splits = members.map((member: any, index: number) => ({
      userId: member.id || `user-${index}`,
      name: member.name || `Usuario ${index + 1}`,
      amount: splitAmount,
      percentage: (100 / members.length),
    }));

    res.json({
      success: true,
      data: {
        totalAmount: amount,
        currency: 'USD',
        splitType,
        splits,
        summary: {
          totalMembers: members.length,
          amountPerPerson: splitAmount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error calculando la división',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    availableEndpoints: [
      'GET /health',
      'GET /api/test',
      'POST /api/calculate-split',
    ],
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: error.message,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
🚀 ¡Partio API está corriendo!

📍 URL: http://localhost:${PORT}
🔍 Health check: http://localhost:${PORT}/health
🧪 Test endpoint: http://localhost:${PORT}/api/test
🧮 Calculator: POST http://localhost:${PORT}/api/calculate-split

🎯 Endpoints disponibles:
   GET  /health
   GET  /api/test  
   POST /api/calculate-split

💡 Para probar el calculador:
   curl -X POST http://localhost:${PORT}/api/calculate-split \\
     -H "Content-Type: application/json" \\
     -d '{"amount": 100, "members": [{"name": "Alice"}, {"name": "Bob"}]}'
`);
});

export default app;
