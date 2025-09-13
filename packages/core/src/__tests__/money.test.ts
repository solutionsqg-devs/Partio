import { 
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
  getSupportedCurrencies
} from '../money';
import { ValidationError } from '../types';

/**
 * Tests unitarios para utilidades de dinero
 */

describe('Money Utilities', () => {
  describe('formatMoney', () => {
    it('should format USD correctly', () => {
      expect(formatMoney(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatMoney(0.99, 'USD')).toBe('$0.99');
      expect(formatMoney(1000000, 'USD')).toBe('$1,000,000.00');
    });

    it('should format ARS correctly', () => {
      expect(formatMoney(1234.56, 'ARS')).toMatch(/1.*234.*56/); // Formato puede variar por locale
    });

    it('should format CLP correctly (no decimals)', () => {
      expect(formatMoney(1234, 'CLP')).toMatch(/1.*234/);
    });

    it('should throw error for unsupported currency', () => {
      expect(() => formatMoney(100, 'XXX' as any)).toThrow(ValidationError);
    });

    it('should handle rounding', () => {
      expect(formatMoney(1.999, 'USD')).toBe('$2.00');
      expect(formatMoney(1.001, 'USD')).toBe('$1.00');
    });
  });

  describe('formatMoneyCompact', () => {
    it('should format without currency symbol in number', () => {
      const formatted = formatMoneyCompact(1234.56, 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,234.56');
    });
  });

  describe('parseMoney', () => {
    it('should parse USD format', () => {
      expect(parseMoney('$1,234.56', 'USD')).toBe(1234.56);
      expect(parseMoney('$ 1,234.56', 'USD')).toBe(1234.56);
      expect(parseMoney('1234.56', 'USD')).toBe(1234.56);
    });

    it('should parse European format with comma as decimal', () => {
      expect(parseMoney('1.234,56', 'EUR')).toBe(1234.56);
      expect(parseMoney('1234,56', 'EUR')).toBe(1234.56);
    });

    it('should throw error for invalid format', () => {
      expect(() => parseMoney('invalid', 'USD')).toThrow(ValidationError);
      expect(() => parseMoney('', 'USD')).toThrow(ValidationError);
    });

    it('should handle no decimals', () => {
      expect(parseMoney('1234', 'USD')).toBe(1234);
    });
  });

  describe('createMoney', () => {
    it('should create money object', () => {
      const money = createMoney(123.456, 'USD');
      expect(money.amount).toBe(123.46); // Rounded to 2 decimals
      expect(money.currency).toBe('USD');
    });

    it('should throw error for negative amount', () => {
      expect(() => createMoney(-100, 'USD')).toThrow(ValidationError);
    });

    it('should handle zero amount', () => {
      const money = createMoney(0, 'USD');
      expect(money.amount).toBe(0);
    });
  });

  describe('addMoney', () => {
    it('should add money of same currency', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(50, 'USD');
      const result = addMoney(money1, money2);
      
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('USD');
    });

    it('should throw error for different currencies', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(50, 'EUR');
      
      expect(() => addMoney(money1, money2)).toThrow(ValidationError);
    });
  });

  describe('subtractMoney', () => {
    it('should subtract money of same currency', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(30, 'USD');
      const result = subtractMoney(money1, money2);
      
      expect(result.amount).toBe(70);
      expect(result.currency).toBe('USD');
    });

    it('should allow negative result', () => {
      const money1 = createMoney(30, 'USD');
      const money2 = createMoney(100, 'USD');
      const result = subtractMoney(money1, money2);
      
      expect(result.amount).toBe(-70);
    });

    it('should throw error for different currencies', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(50, 'EUR');
      
      expect(() => subtractMoney(money1, money2)).toThrow(ValidationError);
    });
  });

  describe('multiplyMoney', () => {
    it('should multiply money by factor', () => {
      const money = createMoney(100, 'USD');
      const result = multiplyMoney(money, 2.5);
      
      expect(result.amount).toBe(250);
      expect(result.currency).toBe('USD');
    });

    it('should throw error for negative factor', () => {
      const money = createMoney(100, 'USD');
      
      expect(() => multiplyMoney(money, -1)).toThrow(ValidationError);
    });

    it('should handle zero factor', () => {
      const money = createMoney(100, 'USD');
      const result = multiplyMoney(money, 0);
      
      expect(result.amount).toBe(0);
    });
  });

  describe('divideMoney', () => {
    it('should divide money by divisor', () => {
      const money = createMoney(100, 'USD');
      const result = divideMoney(money, 4);
      
      expect(result.amount).toBe(25);
      expect(result.currency).toBe('USD');
    });

    it('should throw error for zero divisor', () => {
      const money = createMoney(100, 'USD');
      
      expect(() => divideMoney(money, 0)).toThrow(ValidationError);
    });

    it('should throw error for negative divisor', () => {
      const money = createMoney(100, 'USD');
      
      expect(() => divideMoney(money, -2)).toThrow(ValidationError);
    });

    it('should handle decimal result', () => {
      const money = createMoney(100, 'USD');
      const result = divideMoney(money, 3);
      
      expect(result.amount).toBeCloseTo(33.33, 2);
    });
  });

  describe('convertMoney', () => {
    it('should convert between currencies', () => {
      const usd = createMoney(100, 'USD');
      const ars = convertMoney(usd, 'ARS', 350);
      
      expect(ars.amount).toBe(35000);
      expect(ars.currency).toBe('ARS');
    });

    it('should return same money if same currency', () => {
      const money = createMoney(100, 'USD');
      const result = convertMoney(money, 'USD', 1);
      
      expect(result).toEqual(money);
    });

    it('should throw error for invalid rate', () => {
      const money = createMoney(100, 'USD');
      
      expect(() => convertMoney(money, 'EUR', 0)).toThrow(ValidationError);
      expect(() => convertMoney(money, 'EUR', -1)).toThrow(ValidationError);
    });
  });

  describe('compareMoney', () => {
    it('should compare money correctly', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(50, 'USD');
      const money3 = createMoney(100, 'USD');
      
      expect(compareMoney(money1, money2)).toBe(1);
      expect(compareMoney(money2, money1)).toBe(-1);
      expect(compareMoney(money1, money3)).toBe(0);
    });

    it('should throw error for different currencies', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(50, 'EUR');
      
      expect(() => compareMoney(money1, money2)).toThrow(ValidationError);
    });
  });

  describe('isEqualMoney', () => {
    it('should return true for equal money', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(100, 'USD');
      
      expect(isEqualMoney(money1, money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(50, 'USD');
      
      expect(isEqualMoney(money1, money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = createMoney(100, 'USD');
      const money2 = createMoney(100, 'EUR');
      
      expect(isEqualMoney(money1, money2)).toBe(false);
    });

    it('should handle rounding tolerance', () => {
      const money1 = createMoney(100.001, 'USD');
      const money2 = createMoney(100.009, 'USD');
      
      expect(isEqualMoney(money1, money2)).toBe(true); // Dentro de tolerancia
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbols', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('EUR')).toBe('€');
      expect(getCurrencySymbol('ARS')).toBe('$');
      expect(getCurrencySymbol('PEN')).toBe('S/');
    });

    it('should throw error for unsupported currency', () => {
      expect(() => getCurrencySymbol('XXX' as any)).toThrow(ValidationError);
    });
  });

  describe('isSupportedCurrency', () => {
    it('should return true for supported currencies', () => {
      expect(isSupportedCurrency('USD')).toBe(true);
      expect(isSupportedCurrency('EUR')).toBe(true);
      expect(isSupportedCurrency('ARS')).toBe(true);
    });

    it('should return false for unsupported currencies', () => {
      expect(isSupportedCurrency('XXX')).toBe(false);
      expect(isSupportedCurrency('')).toBe(false);
      expect(isSupportedCurrency('usd')).toBe(false); // Case sensitive
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return array of supported currencies', () => {
      const currencies = getSupportedCurrencies();
      
      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(0);
      expect(currencies).toContain('USD');
      expect(currencies).toContain('EUR');
      expect(currencies).toContain('ARS');
    });
  });
});
