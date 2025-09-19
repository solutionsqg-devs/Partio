# Dockerfile para la API de Partio - Versión simplificada para desarrollo

FROM node:18-alpine

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache openssl libc6-compat

# Instalar pnpm
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN pnpm install

# Copiar código fuente
COPY src ./src
COPY prisma ./prisma

# Generar cliente de Prisma
RUN pnpm run generate

# Exponer puerto
EXPOSE 4000

# Variables de entorno por defecto
ENV NODE_ENV=development
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicio para desarrollo
CMD ["pnpm", "run", "dev"]
