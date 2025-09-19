# 🚀 Guía de Setup para Socio - Partio

## 📋 Requisitos Previos

**Solo necesitas 3 cosas:**

1. **Node.js** (versión 18 o superior) ⚠️ **OBLIGATORIO**
   - Descargar desde: https://nodejs.org/
   - Verificar: `node --version`
   - **Nota**: El proyecto requiere Node.js 18+ (definido en package.json)

2. **pnpm** (gestor de paquetes) ⚠️ **OBLIGATORIO**

   ```bash
   npm install -g pnpm
   # Verificar: pnpm --version
   ```
   - **¿Por qué pnpm?** El proyecto usa `pnpm workspaces` para el monorepo
   - **npm NO funcionará** correctamente con este proyecto

3. **Git** ⚠️ **OBLIGATORIO**
   - Descargar desde: https://git-scm.com/
   - Verificar: `git --version`

**¡Eso es todo para el modo simple!** Para el modo completo con Docker, sigue leyendo.

## 🐳 Setup con Docker (Modo Completo)

Si quieres ejecutar el proyecto completo con base de datos y todos los servicios:

### 1. **Requisitos adicionales**

- **Docker Desktop** (Windows/Mac) o **Docker Engine** (Linux)
  - Descargar desde: https://www.docker.com/products/docker-desktop/
  - Verificar: `docker --version` y `docker-compose --version`

### 2. **Configuración inicial**

```bash
# Copiar archivos de configuración
cp apps/api/env.example apps/api/.env
cp apps/web/env.example apps/web/.env
```

### 3. **Levantar Docker**

```bash
# Levantar todos los servicios
pnpm run docker:dev

# En otra terminal: ejecutar migraciones
pnpm run migrate:dev

# En otra terminal: cargar datos de ejemplo (opcional)
pnpm run seed

# En otra terminal: levantar el frontend
pnpm --filter web run dev
```

### 4. **URLs disponibles**

- **🎨 Frontend**: http://localhost:3000
- **🔧 API**: http://localhost:4000
- **📊 API Docs**: http://localhost:4000/api-docs
- **🗄️ Adminer (Base de datos)**: http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: postgres
  - Usuario: partio
  - Contraseña: partio123
  - Base de datos: partio_dev
- **🔴 Redis Commander**: http://localhost:8081
  - Usuario: admin
  - Contraseña: admin123

### 5. **Comandos útiles de Docker**

```bash
# Ver logs en tiempo real
docker-compose -f infra/docker/docker-compose.yml logs -f

# Ver logs solo del API
docker logs -f partio-api

# Detener todos los servicios
pnpm run docker:down

# Reiniciar solo el API
docker-compose -f infra/docker/docker-compose.yml restart api
```

### 6. **Solución de problemas comunes**

- **Error: Puerto ocupado**
  ```bash
  # Ver qué está usando el puerto
  netstat -ano | findstr :4000  # Windows
  lsof -i :4000                 # Mac/Linux
  ```

- **Error: Docker no responde**
  ```bash
  # Reiniciar Docker Desktop
  # O limpiar contenedores
  docker system prune -a
  ```

## 🔄 Clonar el Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/solutionsqg-devs/Partio.git

# Entrar al directorio
cd Partio
```

## 📦 Instalación de Dependencias

### ✅ **Respuesta Corta: SÍ, solo con `pnpm install`**

```bash
# Instalar todas las dependencias del monorepo
pnpm install
```

### 🔍 **¿Qué hace este comando?**

El comando `pnpm install` automáticamente:

1. **Lee `pnpm-workspace.yaml`** y detecta todos los sub-proyectos
2. **Instala dependencias del root** (ESLint, Prettier, TypeScript)
3. **Instala dependencias del API** (`apps/api/package.json`)
4. **Instala dependencias del Web** (`apps/web/package.json`)
5. **Crea enlaces simbólicos** entre proyectos del monorepo
6. **Optimiza el almacenamiento** (pnpm es más eficiente que npm)

### 📊 **Dependencias que se instalan:**

**Backend (`apps/api`):**
- Express, Prisma, JWT, Zod, etc.

**Frontend (`apps/web`):**
- React, Vite, Radix UI, Tailwind CSS, Framer Motion, etc.

**Root (herramientas compartidas):**
- TypeScript, ESLint, Prettier

### ⚠️ **Importante:**
- **NO uses `npm install`** - no funcionará correctamente
- **NO instales en subdirectorios** - hazlo solo desde la raíz
- **Tiempo estimado**: 2-5 minutos dependiendo de tu conexión

### 🔍 **Verificar que todo se instaló correctamente:**

```bash
# Verificar estructura de node_modules
ls node_modules/@radix-ui  # Debe mostrar componentes de Radix UI
ls apps/api/node_modules   # Debe existir
ls apps/web/node_modules   # Debe existir

# Verificar que los comandos funcionan
pnpm --filter api run --help
pnpm --filter web run --help
```

### 🐛 **Si algo falla en la instalación:**

```bash
# Limpiar todo y reinstalar
rm -rf node_modules
rm -rf apps/*/node_modules
rm pnpm-lock.yaml
pnpm install

# En Windows (PowerShell):
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force apps/*/node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

## 🚀 Ejecutar la Aplicación

### Opción 1: Modo Completo (Recomendado para pruebas)

```bash
# Iniciar backend en modo simple (sin base de datos)
pnpm --filter api run dev:simple

# En otra terminal, iniciar el frontend
pnpm --filter web run dev
```

### Opción 2: Un solo comando (puede fallar si no tienes Docker)

```bash
# Intentar iniciar todo junto
pnpm run dev
```

## 🌐 URLs de la Aplicación

Una vez que ambos servicios estén corriendo:

- **🎨 Frontend (Web App)**: http://localhost:3000
- **🔧 Backend (API)**: http://localhost:4000
- **📊 API Health Check**: http://localhost:4000/health

## 🧪 Cómo Probar la Aplicación

### 1. **Registro de Usuario**

- Ve a: http://localhost:3000
- Haz clic en "Regístrate aquí"
- Completa el formulario con cualquier email/password
- ✅ Deberías ser redirigido al dashboard

### 2. **Explorar el Dashboard**

- Verás estadísticas de grupos y gastos
- Interfaz moderna con dark/light mode
- Navegación responsive

### 3. **Crear un Grupo**

- Haz clic en "Nuevo Grupo"
- Completa: nombre, descripción (opcional), moneda
- ✅ El grupo se creará y aparecerá en el dashboard

### 4. **Funcionalidades Disponibles**

- ✅ **Autenticación**: Login/Signup funcional
- ✅ **Dashboard**: Vista moderna con estadísticas
- ✅ **Grupos**: Crear y listar grupos
- ✅ **Dark Mode**: Toggle en el header
- ✅ **Responsive**: Funciona en móvil y desktop
- ✅ **Navegación**: Header con menú completo

## 🎨 Características del Diseño

### **Sistema de Diseño Profesional**

- **Design Tokens**: Colores, tipografía, espaciado consistentes
- **Componentes**: Button, Card, Input con variantes
- **Animaciones**: Micro-interacciones con Framer Motion
- **Accesibilidad**: WCAG AA, focus visible, ARIA labels

### **Tecnologías Implementadas**

- **Frontend**: React + Vite + TypeScript + Radix UI + Tailwind CSS
- **Backend**: Node.js + Express (modo simulado)
- **Monorepo**: pnpm workspaces
- **Linting**: ESLint + Prettier

## 🐛 Solución de Problemas

### **Error: Puerto ocupado**

```bash
# Cambiar puertos si están ocupados
# Frontend: editar vite.config.ts (puerto 3000)
# Backend: editar server-simple.ts (puerto 4000)
```

### **Error: Dependencias**

```bash
# Limpiar e instalar de nuevo
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### **Error: TypeScript**

```bash
# Verificar tipos
pnpm --filter web run lint
```

## 📱 Testing en Móvil

1. **Obtener IP local**:

   ```bash
   # Windows
   ipconfig
   # Mac/Linux
   ifconfig
   ```

2. **Acceder desde móvil**:
   - Frontend: `http://TU_IP:3000`
   - Asegúrate de estar en la misma red WiFi

## 🔄 Comandos Útiles

```bash
# Ver estado de los servicios
curl http://localhost:4000/health
curl http://localhost:3000

# Logs del backend
# (aparecerán en la terminal donde ejecutaste dev:simple)

# Reiniciar servicios
# Ctrl+C para detener, luego volver a ejecutar los comandos
```

## 📊 Datos de Prueba

El backend en modo simple incluye:

- **Grupos de ejemplo**: "Viaje a Bariloche", "Casa Compartida"
- **Usuarios simulados**: Cualquier email/password funciona
- **Balances mock**: Datos aleatorios para demostración

## 🎯 Próximos Pasos

Una vez que pruebes la aplicación actual, podemos continuar con:

- **AddExpenseModal**: Formulario para agregar gastos
- **SplitEditor**: Calculadora de divisiones
- **Páginas adicionales**: Detalle de grupo, configuración
- **Base de datos real**: PostgreSQL + Prisma

## 💬 Feedback

Después de probar, comparte tu feedback sobre:

- ✅ **Funcionalidad**: ¿Todo funciona como esperabas?
- 🎨 **Diseño**: ¿Te gusta la interfaz?
- 📱 **UX**: ¿Es intuitivo de usar?
- 🚀 **Performance**: ¿Carga rápido?

---

**¿Problemas?** Contacta al equipo de desarrollo con:

- Capturas de pantalla de errores
- Logs de la terminal
- Descripción de lo que intentabas hacer
