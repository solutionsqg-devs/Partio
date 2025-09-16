# Partio - SaaS de Gastos Compartidos

Partio es una plataforma moderna para gestionar gastos compartidos entre grupos de personas. Construido con **Clean Architecture**, **TypeScript** y principios de **escalabilidad** y **modularidad**.

## 🚀 Características Principales

- ✅ **Gestión de Grupos**: Crear y administrar grupos de gastos
- ✅ **División Inteligente**: Múltiples formas de dividir gastos (equitativo, exacto, porcentaje)
- ✅ **Cálculo de Balances**: Algoritmo optimizado para minimizar transacciones
- ✅ **Multi-moneda**: Soporte para múltiples monedas con conversión
- ✅ **API REST**: Documentada con OpenAPI/Swagger
- ✅ **Autenticación JWT**: Segura y stateless
- ✅ **Real-time**: Actualizaciones en tiempo real con WebSockets
- ✅ **PWA Ready**: Funcionalidad offline para web
- ✅ **React Native**: App móvil multiplataforma

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend**

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis (cache y colas)
- JWT Authentication
- Docker + Kubernetes

**Frontend**

- React + Vite + TypeScript
- React Native (móvil)
- PWA capabilities
- Tailwind CSS

**DevOps**

- GitHub Actions (CI/CD)
- Docker Compose (desarrollo)
- Kubernetes (producción)
- Nginx (proxy reverso)

### Principios de Diseño

- **Clean Architecture**: Separación clara de capas y responsabilidades
- **SOLID**: Principios de diseño orientado a objetos
- **API-First**: Contratos bien definidos entre servicios
- **Modularidad**: Componentes desacoplados y reutilizables
- **Escalabilidad**: Diseñado para crecer horizontal y verticalmente
- **Seguridad**: OWASP Top 10, validación estricta, encriptación

## 📁 Estructura del Proyecto

```
/partio
├── apps/
│   ├── api/          # Backend Node.js + Express
│   ├── web/          # Frontend React + Vite
│   └── mobile/       # App React Native
├── packages/
│   ├── core/         # Lógica compartida (cálculos, validaciones)
│   └── ui/           # Componentes UI compartidos
├── infra/
│   ├── docker/       # Docker Compose y configuraciones
│   └── k8s/          # Manifiestos de Kubernetes
├── docs/             # Documentación técnica
└── .github/          # CI/CD workflows
```

## 🛠️ Setup Local

### Prerrequisitos

- Node.js 18+
- pnpm 8+
- Docker y Docker Compose
- PostgreSQL 15+ (o usar Docker)
- Redis 7+ (o usar Docker)

### Instalación Rápida

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-org/partio.git
cd partio
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

```bash
cp apps/api/env.example apps/api/.env
# Editar apps/api/.env con tus configuraciones
```

4. **Levantar servicios con Docker**

```bash
pnpm run docker:dev
```

5. **Ejecutar migraciones**

```bash
pnpm run migrate:dev
```

6. **Cargar datos de ejemplo**

```bash
pnpm run seed
```

7. **Iniciar desarrollo**

```bash
pnpm run dev
```

### URLs de Desarrollo

- **API**: http://localhost:4000
- **Web App**: http://localhost:3000 ✅ (React + Vite + Radix UI)
- **API Docs**: http://localhost:4000/api-docs
- **Adminer (DB)**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

## 📚 Comandos Disponibles

### Desarrollo

```bash
pnpm dev              # Iniciar todos los servicios en desarrollo
pnpm start:api        # Solo API
pnpm start:web        # Solo Web App
pnpm start:mobile     # Solo Mobile App
```

### Base de Datos

```bash
pnpm migrate:dev      # Ejecutar migraciones en desarrollo
pnpm migrate:deploy   # Ejecutar migraciones en producción
pnpm seed             # Cargar datos de ejemplo
```

### Testing

```bash
pnpm test             # Ejecutar todos los tests
pnpm test:watch       # Tests en modo watch
pnpm test:coverage    # Tests con coverage
```

### Linting y Formato

```bash
pnpm lint             # Ejecutar ESLint
pnpm lint:fix         # Ejecutar ESLint con auto-fix
pnpm format           # Formatear código con Prettier
```

### Build y Deploy

```bash
pnpm build            # Build de producción
pnpm docker:dev       # Levantar con Docker Compose
pnpm docker:down      # Detener servicios Docker
```

## 🔧 Configuración

### Variables de Entorno

Copiar `apps/api/env.example` a `apps/api/.env` y configurar:

```env
# Base de datos
DATABASE_URL="postgresql://partio:partio123@localhost:5432/partio_dev"

# JWT
JWT_SECRET="tu-jwt-secret-super-seguro"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Servidor
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### Docker Compose

El archivo `infra/docker/docker-compose.yml` incluye:

- PostgreSQL 15
- Redis 7
- Adminer (administración de BD)
- Redis Commander
- Nginx (proxy reverso)

## 🧪 Testing

### Estrategia de Testing

- **Unit Tests**: Lógica de negocio y utilidades
- **Integration Tests**: APIs y base de datos
- **E2E Tests**: Flujos críticos de usuario

### Ejecutar Tests

```bash
# Tests unitarios del core
pnpm --filter @partio/core test

# Tests de integración de la API
pnpm --filter api test

# Todos los tests con coverage
pnpm test:coverage
```

## 📖 Documentación de la API

La API está documentada con OpenAPI 3.0. Acceder a:

- **Swagger UI**: http://localhost:4000/api-docs
- **OpenAPI Spec**: `apps/api/src/openapi.yaml`

### Endpoints Principales

```
POST /auth/signup     # Registro de usuario
POST /auth/signin     # Inicio de sesión
GET  /auth/profile    # Perfil del usuario

GET  /groups          # Listar grupos del usuario
POST /groups          # Crear nuevo grupo
GET  /groups/:id      # Detalle de grupo con balances

POST /groups/:id/expenses    # Crear gasto en grupo
GET  /groups/:id/expenses    # Listar gastos del grupo
PUT  /expenses/:id           # Actualizar gasto
DELETE /expenses/:id         # Eliminar gasto
```

## 🚀 Deployment

### Desarrollo

```bash
docker-compose -f infra/docker/docker-compose.yml up --build
```

### Producción con Kubernetes

```bash
kubectl apply -f infra/k8s/
```

### CI/CD

El pipeline de GitHub Actions incluye:

- ✅ Linting y formato
- ✅ Tests unitarios e integración
- ✅ Build de aplicaciones
- ✅ Security scanning
- ✅ Build y push de imágenes Docker
- ✅ Deploy automático

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- TypeScript estricto
- ESLint + Prettier
- Conventional Commits
- Tests obligatorios para nuevas funcionalidades
- Documentación actualizada

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🌐 Aplicación Web

La aplicación web está construida con **React + Vite + TypeScript + Radix UI** y ofrece una experiencia moderna y responsiva.

### Características de la Web

- ✅ **Autenticación completa**: Login/Signup con validación
- ✅ **Dashboard intuitivo**: Vista general de grupos y estadísticas
- ✅ **Gestión de grupos**: Crear, ver y administrar grupos
- ✅ **Interfaz moderna**: Radix UI + Tailwind CSS
- ✅ **PWA Ready**: Funcionalidad offline y instalable
- ✅ **Responsive**: Optimizada para móvil y desktop
- ✅ **TypeScript**: Tipado estricto y autocompletado

### Flujo de Usuario

1. **Registro/Login**: http://localhost:3000
2. **Dashboard**: Vista de grupos y estadísticas
3. **Crear Grupo**: Formulario con validación
4. **Detalle de Grupo**: Balances y gastos recientes
5. **Agregar Gastos**: Formulario inteligente de splits

### Desarrollo Web

```bash
# Solo la aplicación web
pnpm --filter web run dev

# Con hot reload y proxy al API
# Automáticamente proxy /api/* → http://localhost:4000
```

## 👥 Equipo

- **Arquitectura**: Clean Architecture + SOLID
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Frontend**: React + Vite + TypeScript + Radix UI ✅
- **Mobile**: React Native + TypeScript
- **DevOps**: Docker + Kubernetes + GitHub Actions

---

**¿Preguntas?** Abrir un [issue](https://github.com/tu-org/partio/issues) o contactar al equipo.
