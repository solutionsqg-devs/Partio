# 🚀 Guía de Setup para Socio - Partio

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

1. **Node.js** (versión 18 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar: `node --version`

2. **pnpm** (gestor de paquetes)

   ```bash
   npm install -g pnpm
   # Verificar: pnpm --version
   ```

3. **Git**
   - Descargar desde: https://git-scm.com/
   - Verificar: `git --version`

## 🔄 Clonar el Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/solutionsqg-devs/Partio.git

# Entrar al directorio
cd Partio
```

## 📦 Instalación de Dependencias

```bash
# Instalar todas las dependencias del monorepo
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
