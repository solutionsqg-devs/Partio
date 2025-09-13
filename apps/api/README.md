## COMANDOS INICIALES
1- npm init -y

2) -npm install express
   -npm install --save-dev @types/express

3- npm install --save-dev nodemon

4) npm install --save-dev typescript ts-node nodemon @types/node

## Inicializar TypeScript
npx tsc --init

## Endpoints implementados:

POST /auth/signup          # Registro con hash bcrypt
POST /auth/signin          # Login con JWT
GET  /auth/profile         # Perfil del usuario
PUT  /auth/profile         # Actualizar perfil
PUT  /auth/password        # Cambiar contraseña

GET  /groups               # Listar grupos del usuario
POST /groups               # Crear nuevo grupo
GET  /groups/:id           # Detalle con balances calculados
PUT  /groups/:id           # Actualizar grupo
DELETE /groups/:id         # Eliminar grupo
POST /groups/:id/members   # Agregar miembro
GET  /groups/:id/settlements # Sugerencias de liquidación

POST /groups/:id/expenses  # Crear gasto en grupo
GET  /groups/:id/expenses  # Listar gastos paginados
GET  /expenses/:id         # Detalle de gasto
PUT  /expenses/:id         # Actualizar gasto
DELETE /expenses/:id       # Eliminar gasto (soft delete)

POST /webhooks/mercadopago # Webhook con validación de firma
POST /webhooks/stripe      # Webhook para Stripe



-- Entidades principales implementadas:
User (usuarios)
Group (grupos de gastos)
GroupMember (membresías con roles)
Expense (gastos individuales)
ExpenseSplit (divisiones de gastos)
Receipt (recibos/comprobantes)
Settlement (liquidaciones)
CurrencyRate (tasas de cambio)