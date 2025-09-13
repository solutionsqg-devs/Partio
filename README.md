Quiero que siempre tengas en cuenta lo siguiente:

## Principios de Arquitectura

- **Modularidad total**: cada capa del sistema debe estar desacoplada y ser independiente.
- **Escalabilidad**: todo debe diseñarse para crecer horizontal y verticalmente.
- **Portabilidad**: que pueda desplegarse en múltiples entornos (cloud, containers, serverless).
- **Clean Architecture y SOLID** en todas las capas.
- **API-first**: la lógica de negocio expuesta vía REST/GraphQL, con contratos bien definidos.

## Backend

- Usar **Node.js con Express**.
- Código en **TypeScript**.
- **Base de datos PostgreSQL** para transacciones financieras (con esquema relacional sólido).
- **Redis** para caché y colas de mensajería.
- Arquitectura **stateless** con soporte para **Docker** y orquestación en **Kubernetes**.
- Manejo de autenticación y autorización con **JWT**, y preparado para 2FA.
- Integración con servicios externos (pagos, notificaciones) mediante **adaptadores desacoplados**. (stripe, mercado pago)

## Frontend

- **Web**: React (con soporte PWA).
- **Móvil**: React native (para Android con un solo código base).
- Código modular con componentes reutilizables.
- Estándares de accesibilidad y diseño responsivo.

## Seguridad

- Todo sobre **HTTPS/TLS**.
- Sanitización y validación estricta de inputs.
- Prevención de OWASP Top 10 (SQL Injection, XSS, CSRF, etc.).
- Encriptación de datos sensibles en reposo (KMS) y en tránsito.
- Manejo robusto de roles y permisos.

## Infraestructura y DevOps

- Despliegue con **CI/CD** (GitHub Actions).
- Uso de **Docker** para contenedores, **Kubernetes** para escalado.
- Observabilidad: logs estructurados, métricas y tracing (OpenTelemetry).
- Monitoreo y alertas con herramientas como Grafana/Prometheus.
- Backups automáticos y política de recuperación ante desastres (RPO/RTO definidos).

## Buenas prácticas

- Testing: unitarios, integración y end-to-end desde el inicio.
- Code style: ESLint/Prettier en front y back.
- Documentación clara (README, OpenAPI/Swagger para API).
- Versionado semántico y git flow.
- Feature flags para nuevos módulos.

## Tu Rol

Cada vez que te dé una tarea, debes:

1. Proponer la mejor solución siguiendo estas bases de arquitectura.
2. Justificar por qué la eliges (módulo, stack, patrón).
3. Generar código limpio, comentado solo donde sea crítico (no sobrecargar).
4. Mantener consistencia entre backend, frontend e infraestructura.

## ESTRUCTURA

/partio
-/apps
--/web -> React (frontend web)
--/mobile -> React Native (app móvil iOS/Android)
--/api -> Node.js backend (REST/GraphQL)
-/packages
--/core -> lógica compartida (validaciones, cálculos, formateo de divisas)
--/ui -> componentes compartidos (design system base, puede usarse en web y RN con libs como React Native Web)
-/infra
--/db -> migraciones y seeds (Prisma/Knex)
--/docker -> Dockerfiles, docker-compose, configs CI/CD
-/docs -> documentación técnica, arquitectura, decisiones de diseño
