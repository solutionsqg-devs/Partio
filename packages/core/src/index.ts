/**
 * Partio Core Package
 * Lógica compartida para el SaaS de gastos compartidos
 * 
 * Este paquete contiene:
 * - Utilidades de manejo de dinero y monedas
 * - Calculadora de divisiones de gastos
 * - Validadores y esquemas de datos
 * - Tipos compartidos
 */

// Exportar tipos
export * from './types.js';

// Exportar utilidades de dinero
export {
  formatMoney,
  formatMoneyCompact,
  parseMoney,
  createMoney,
  addMoney,
  subtractMoney,
  multiplyMoney,
  divideMoney,
  convertMoney,
  compareMoney,
  isEqualMoney,
  getCurrencySymbol,
  isSupportedCurrency,
  getSupportedCurrencies,
} from './money.js';

// Exportar calculadora de splits
export {
  calculateSplits,
  validateSplitsTotal,
  calculateMemberBalances,
  getSplitSummary,
} from './splits.js';

// Exportar validadores
export {
  currencySchema,
  positiveAmountSchema,
  userIdSchema,
  splitTypeSchema,
  moneySchema,
  expenseMemberSchema,
  expenseSplitSchema,
  customSplitSchema,
  splitCalculationInputSchema,
  expenseSchema,
  groupBalanceSchema,
  settlementSchema,
  currencyRateSchema,
  createExpenseFormSchema,
  updateExpenseFormSchema,
  createGroupFormSchema,
  updateGroupFormSchema,
  validateEmail,
  validatePassword,
  validateCurrency,
  validateAmount,
} from './validators.js';

// Exportar tipos de validadores
export type {
  CreateExpenseForm,
  UpdateExpenseForm,
  CreateGroupForm,
  UpdateGroupForm,
} from './validators.js';

// Constantes útiles
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU'
] as const;

export const SPLIT_TYPES = ['EQUAL', 'EXACT', 'PERCENTAGE'] as const;

// Versión del paquete
export const VERSION = '1.0.0';
