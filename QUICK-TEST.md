# ⚡ Test Rápido - Partio

## 🎯 Para Probar en 5 Minutos

### 1. **Verificar Requisitos**
```bash
node --version    # Debe ser 18+
pnpm --version    # Si no tienes: npm install -g pnpm
git --version
```

### 2. **Clonar y Setup**
```bash
git clone https://github.com/solutionsqg-devs/Partio.git
cd Partio
pnpm install    # ⚠️ SOLO pnpm (no npm) - instala TODO automáticamente
```

**¿Qué instala `pnpm install`?**
- ✅ Dependencias del backend (Express, Prisma, etc.)
- ✅ Dependencias del frontend (React, Radix UI, etc.)
- ✅ Herramientas compartidas (TypeScript, ESLint, etc.)
- ✅ Enlaces entre proyectos del monorepo

### 3. **Iniciar Servicios**

**Terminal 1 (Backend):**
```bash
pnpm --filter api run dev:simple
# Esperar a ver: "🚀 ¡Partio API está corriendo!"
```

**Terminal 2 (Frontend):**
```bash
pnpm --filter web run dev
# Esperar a ver: "Local: http://localhost:3000/"
```

### 4. **Probar la App**

1. **Abrir**: http://localhost:3000
2. **Registrarse**: Cualquier email/password
3. **Dashboard**: Ver interfaz moderna
4. **Crear Grupo**: Botón "Nuevo Grupo"
5. **Dark Mode**: Toggle en el header
6. **Mobile**: Probar en móvil (responsive)

## ✅ Checklist de Funcionalidades

- [ ] **Login/Signup** funciona
- [ ] **Dashboard** se carga con estadísticas
- [ ] **Crear grupo** funciona
- [ ] **Dark/Light mode** cambia
- [ ] **Responsive** en móvil
- [ ] **Navegación** header completa
- [ ] **Animaciones** suaves

## 🔧 Verificar Estado

```bash
# Backend funcionando
curl http://localhost:4000/health

# Frontend funcionando  
curl http://localhost:3000
```

## 📱 URLs Importantes

- **App**: http://localhost:3000
- **API**: http://localhost:4000
- **Health**: http://localhost:4000/health

## 🐛 Si algo falla

```bash
# Reiniciar todo
# Ctrl+C en ambas terminales, luego:
pnpm --filter api run dev:simple
pnpm --filter web run dev

# Limpiar dependencias
rm -rf node_modules
pnpm install
```

## 🎨 Lo que verás

- **Diseño moderno** con Radix UI + Tailwind
- **Animaciones sutiles** con Framer Motion
- **Dashboard profesional** con estadísticas
- **Componentes accesibles** (WCAG AA)
- **PWA ready** (instalable)

---

**¿Todo funciona?** ¡Perfecto! 🎉  
**¿Problemas?** Comparte screenshots y logs.
