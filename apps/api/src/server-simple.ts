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

// Endpoints de autenticación simulados
app.post('/auth/signup', (req, res) => {
  console.log('Signup request (simple mode):', req.body);
  
  const { email, password, name } = req.body;
  
  // Validación básica
  if (!email || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email, password y name son requeridos' 
    });
  }

  // Simular usuario creado
  const mockUser = {
    id: 'user_' + Date.now(),
    email,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTokens = {
    accessToken: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
  };

  res.status(201).json({ 
    success: true, 
    message: 'Usuario registrado exitosamente', 
    data: { 
      user: mockUser,
      tokens: mockTokens
    } 
  });
});

app.post('/auth/signin', (req, res) => {
  console.log('Signin request (simple mode):', req.body);
  
  const { email, password } = req.body;
  
  // Validación básica
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email y password son requeridos' 
    });
  }

  // Simular usuario autenticado
  const mockUser = {
    id: 'user_' + Date.now(),
    email,
    name: 'Usuario Demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockTokens = {
    accessToken: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
  };

  res.status(200).json({ 
    success: true, 
    message: 'Login exitoso', 
    data: { 
      user: mockUser,
      tokens: mockTokens
    } 
  });
});

app.get('/auth/profile', (req, res) => {
  console.log('Profile request (simple mode)');
  
  // Simular usuario autenticado
  const mockUser = {
    id: 'user_demo',
    email: 'demo@partio.com',
    name: 'Usuario Demo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({ 
    success: true, 
    data: mockUser
  });
});

// Endpoints de grupos simulados
app.get('/groups', (req, res) => {
  console.log('Get groups request (simple mode)');
  
  const mockGroups = [
    {
      id: 'group_1',
      name: 'Viaje a Bariloche',
      description: 'Gastos del viaje de fin de semana',
      currency: 'ARS',
      ownerId: 'user_demo',
      members: [
        { id: 'member_1', userId: 'user_demo', role: 'OWNER' }
      ],
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'group_2',
      name: 'Casa Compartida',
      description: 'Gastos mensuales de la casa',
      currency: 'USD',
      ownerId: 'user_demo',
      members: [
        { id: 'member_2', userId: 'user_demo', role: 'OWNER' }
      ],
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  res.status(200).json({ 
    success: true, 
    data: mockGroups
  });
});

app.post('/groups', (req, res) => {
  console.log('Create group request (simple mode):', req.body);
  
  const { name, description, currency } = req.body;
  
  if (!name || !currency) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name y currency son requeridos' 
    });
  }

  const mockGroup = {
    id: 'group_' + Date.now(),
    name,
    description: description || '',
    currency,
    ownerId: 'user_demo',
    members: [
      { id: 'member_' + Date.now(), userId: 'user_demo', role: 'OWNER' }
    ],
    expenses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(201).json({ 
    success: true, 
    message: 'Grupo creado exitosamente', 
    data: mockGroup
  });
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
      'POST /auth/signup',
      'POST /auth/signin',
      'GET /auth/profile',
      'GET /groups',
      'POST /groups',
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
   POST /auth/signup
   POST /auth/signin
   GET  /auth/profile
   GET  /groups
   POST /groups

💡 Para probar el calculador:
   curl -X POST http://localhost:${PORT}/api/calculate-split \\
     -H "Content-Type: application/json" \\
     -d '{"amount": 100, "members": [{"name": "Alice"}, {"name": "Bob"}]}'
`);
});

export default app;
