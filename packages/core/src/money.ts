import { Currency, Money, CurrencyRate, ValidationError } from './types.js';

/**
 * Utilidades para manejo de dinero y monedas
 * Incluye formateo, parsing y conversiones
 */

// Configuración de formato por moneda
const CURRENCY_CONFIG: Record<Currency, {
  symbol: string;
  decimals: number;
  locale: string;
}> = {
  USD: { symbol: '$', decimals: 2, locale: 'en-US' },
  EUR: { symbol: '€', decimals: 2, locale: 'de-DE' },
  ARS: { symbol: '$', decimals: 2, locale: 'es-AR' },
  BRL: { symbol: 'R$', decimals: 2, locale: 'pt-BR' },
  CLP: { symbol: '$', decimals: 0, locale: 'es-CL' },
  COP: { symbol: '$', decimals: 0, locale: 'es-CO' },
  MXN: { symbol: '$', decimals: 2, locale: 'es-MX' },
  PEN: { symbol: 'S/', decimals: 2, locale: 'es-PE' },
  UYU: { symbol: '$U', decimals: 2, locale: 'es-UY' },
};

/**
 * Formatear cantidad de dinero según la moneda
 */
export function formatMoney(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  
  if (!config) {
    throw new ValidationError(`Moneda no soportada: ${currency}`);
  }

  // Redondear a los decimales apropiados
  const roundedAmount = Math.round(amount * Math.pow(10, config.decimals)) / Math.pow(10, config.decimals);

  // Formatear usando Intl.NumberFormat
  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return formatter.format(roundedAmount);
}

/**
 * Formatear dinero de forma compacta (sin símbolo de moneda)
 */
export function formatMoneyCompact(amount: number, currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  
  if (!config) {
    throw new ValidationError(`Moneda no soportada: ${currency}`);
  }

  const roundedAmount = Math.round(amount * Math.pow(10, config.decimals)) / Math.pow(10, config.decimals);

  const formatter = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return `${config.symbol}${formatter.format(roundedAmount)}`;
}

/**
 * Parsear string de dinero a número
 */
export function parseMoney(moneyString: string, currency: Currency): number {
  const config = CURRENCY_CONFIG[currency];
  
  if (!config) {
    throw new ValidationError(`Moneda no soportada: ${currency}`);
  }

  // Limpiar el string: remover símbolos de moneda y espacios
  let cleanString = moneyString
    .replace(config.symbol, '')
    .replace(/\s/g, '')
    .trim();

  // Manejar diferentes formatos de separadores decimales
  // Reemplazar coma por punto si es el último separador
  const lastComma = cleanString.lastIndexOf(',');
  const lastDot = cleanString.lastIndexOf('.');
  
  if (lastComma > lastDot) {
    // La coma es el separador decimal
    cleanString = cleanString.substring(0, lastComma).replace(/[,.]/g, '') + 
                  '.' + cleanString.substring(lastComma + 1);
  } else {
    // El punto es el separador decimal (o no hay decimales)
    cleanString = cleanString.replace(/,/g, '');
  }

  const parsed = parseFloat(cleanString);
  
  if (isNaN(parsed)) {
    throw new ValidationError(`Formato de dinero inválido: ${moneyString}`);
  }

  return parsed;
}

/**
 * Crear objeto Money
 */
export function createMoney(amount: number, currency: Currency): Money {
  if (amount < 0) {
    throw new ValidationError('El monto no puede ser negativo');
  }

  return {
    amount: Math.round(amount * 100) / 100, // Redondear a 2 decimales
    currency,
  };
}

/**
 * Sumar dos cantidades de dinero (deben ser de la misma moneda)
 */
export function addMoney(money1: Money, money2: Money): Money {
  if (money1.currency !== money2.currency) {
    throw new ValidationError(`No se pueden sumar monedas diferentes: ${money1.currency} y ${money2.currency}`);
  }

  return createMoney(money1.amount + money2.amount, money1.currency);
}

/**
 * Restar dos cantidades de dinero (deben ser de la misma moneda)
 */
export function subtractMoney(money1: Money, money2: Money): Money {
  if (money1.currency !== money2.currency) {
    throw new ValidationError(`No se pueden restar monedas diferentes: ${money1.currency} y ${money2.currency}`);
  }

  return createMoney(money1.amount - money2.amount, money1.currency);
}

/**
 * Multiplicar dinero por un factor
 */
export function multiplyMoney(money: Money, factor: number): Money {
  if (factor < 0) {
    throw new ValidationError('El factor no puede ser negativo');
  }

  return createMoney(money.amount * factor, money.currency);
}

/**
 * Dividir dinero por un divisor
 */
export function divideMoney(money: Money, divisor: number): Money {
  if (divisor <= 0) {
    throw new ValidationError('El divisor debe ser mayor a 0');
  }

  return createMoney(money.amount / divisor, money.currency);
}

/**
 * Convertir dinero de una moneda a otra usando tasa de cambio
 */
export function convertMoney(money: Money, targetCurrency: Currency, rate: number): Money {
  if (money.currency === targetCurrency) {
    return money;
  }

  if (rate <= 0) {
    throw new ValidationError('La tasa de cambio debe ser mayor a 0');
  }

  return createMoney(money.amount * rate, targetCurrency);
}

/**
 * Comparar dos cantidades de dinero (deben ser de la misma moneda)
 */
export function compareMoney(money1: Money, money2: Money): number {
  if (money1.currency !== money2.currency) {
    throw new ValidationError(`No se pueden comparar monedas diferentes: ${money1.currency} y ${money2.currency}`);
  }

  if (money1.amount < money2.amount) return -1;
  if (money1.amount > money2.amount) return 1;
  return 0;
}

/**
 * Verificar si dos cantidades de dinero son iguales
 */
export function isEqualMoney(money1: Money, money2: Money): boolean {
  return money1.currency === money2.currency && 
         Math.abs(money1.amount - money2.amount) < 0.01; // Tolerancia para errores de redondeo
}

/**
 * Obtener el símbolo de una moneda
 */
export function getCurrencySymbol(currency: Currency): string {
  const config = CURRENCY_CONFIG[currency];
  if (!config) {
    throw new ValidationError(`Moneda no soportada: ${currency}`);
  }
  return config.symbol;
}

/**
 * Verificar si una moneda es soportada
 */
export function isSupportedCurrency(currency: string): currency is Currency {
  return currency in CURRENCY_CONFIG;
}

/**
 * Obtener lista de monedas soportadas
 */
export function getSupportedCurrencies(): Currency[] {
  return Object.keys(CURRENCY_CONFIG) as Currency[];
}
