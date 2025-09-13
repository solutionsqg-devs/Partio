import { calculateSplits, validateSplitsTotal, calculateMemberBalances } from '../splits';
import { ExpenseMember, SplitCalculationInput } from '../types';

/**
 * Tests unitarios para el calculador de splits
 * Verifica todos los tipos de división y casos edge
 */

describe('Split Calculator', () => {
  const mockMembers: ExpenseMember[] = [
    { id: 'user1', name: 'Alice' },
    { id: 'user2', name: 'Bob' },
    { id: 'user3', name: 'Charlie' },
  ];

  describe('calculateSplits - EQUAL', () => {
    it('should divide amount equally among members', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'EQUAL',
      };

      const result = calculateSplits(input);

      expect(result.splits).toHaveLength(3);
      expect(result.totalAllocated).toBe(100);
      expect(result.remainder).toBe(0);
      
      // Cada miembro debe pagar 33.33 (con ajuste de centavos)
      const amounts = result.splits.map(s => s.amount);
      expect(amounts[0]).toBe(33.34); // Primer miembro recibe el centavo extra
      expect(amounts[1]).toBe(33.33);
      expect(amounts[2]).toBe(33.33);
      
      // Verificar que todos los splits son tipo EQUAL
      result.splits.forEach(split => {
        expect(split.type).toBe('EQUAL');
      });
    });

    it('should handle amount that divides evenly', () => {
      const input: SplitCalculationInput = {
        totalAmount: 90,
        currency: 'USD',
        members: mockMembers,
        splitType: 'EQUAL',
      };

      const result = calculateSplits(input);

      expect(result.splits).toHaveLength(3);
      expect(result.totalAllocated).toBe(90);
      expect(result.remainder).toBe(0);
      
      // Cada miembro debe pagar exactamente 30
      result.splits.forEach(split => {
        expect(split.amount).toBe(30);
      });
    });

    it('should handle single member', () => {
      const input: SplitCalculationInput = {
        totalAmount: 50,
        currency: 'USD',
        members: [mockMembers[0]!],
        splitType: 'EQUAL',
      };

      const result = calculateSplits(input);

      expect(result.splits).toHaveLength(1);
      expect(result.splits[0]!.amount).toBe(50);
      expect(result.totalAllocated).toBe(50);
    });
  });

  describe('calculateSplits - EXACT', () => {
    it('should use exact amounts for each member', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'EXACT',
        customSplits: [
          { userId: 'user1', amount: 40 },
          { userId: 'user2', amount: 35 },
          { userId: 'user3', amount: 25 },
        ],
      };

      const result = calculateSplits(input);

      expect(result.splits).toHaveLength(3);
      expect(result.totalAllocated).toBe(100);
      expect(Math.abs(result.remainder)).toBeLessThan(0.01);
      
      expect(result.splits[0]!.amount).toBe(40);
      expect(result.splits[1]!.amount).toBe(35);
      expect(result.splits[2]!.amount).toBe(25);
      
      result.splits.forEach(split => {
        expect(split.type).toBe('EXACT');
      });
    });

    it('should throw error if amounts do not match total', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'EXACT',
        customSplits: [
          { userId: 'user1', amount: 40 },
          { userId: 'user2', amount: 35 },
          { userId: 'user3', amount: 30 }, // Total = 105, no 100
        ],
      };

      expect(() => calculateSplits(input)).toThrow('no coincide con el total');
    });

    it('should throw error if missing amount for member', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'EXACT',
        customSplits: [
          { userId: 'user1', amount: 40 },
          { userId: 'user2', amount: 35 },
          // Missing user3
        ],
      };

      expect(() => calculateSplits(input)).toThrow('Todos los miembros deben tener un split personalizado');
    });
  });

  describe('calculateSplits - PERCENTAGE', () => {
    it('should calculate amounts based on percentages', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'PERCENTAGE',
        customSplits: [
          { userId: 'user1', percentage: 50 },
          { userId: 'user2', percentage: 30 },
          { userId: 'user3', percentage: 20 },
        ],
      };

      const result = calculateSplits(input);

      expect(result.splits).toHaveLength(3);
      expect(result.totalAllocated).toBe(100);
      expect(result.remainder).toBe(0);
      
      expect(result.splits[0]!.amount).toBe(50);
      expect(result.splits[0]!.percentage).toBe(50);
      expect(result.splits[1]!.amount).toBe(30);
      expect(result.splits[1]!.percentage).toBe(30);
      expect(result.splits[2]!.amount).toBe(20);
      expect(result.splits[2]!.percentage).toBe(20);
      
      result.splits.forEach(split => {
        expect(split.type).toBe('PERCENTAGE');
      });
    });

    it('should handle rounding in percentage calculations', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'PERCENTAGE',
        customSplits: [
          { userId: 'user1', percentage: 33.33 },
          { userId: 'user2', percentage: 33.33 },
          { userId: 'user3', percentage: 33.34 },
        ],
      };

      const result = calculateSplits(input);

      expect(result.totalAllocated).toBe(100);
      
      // Verificar que la suma es correcta (puede haber ajuste de redondeo)
      const totalCalculated = result.splits.reduce((sum, split) => sum + split.amount, 0);
      expect(Math.abs(totalCalculated - 100)).toBeLessThan(0.01);
    });

    it('should throw error if percentages do not sum to 100', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'PERCENTAGE',
        customSplits: [
          { userId: 'user1', percentage: 40 },
          { userId: 'user2', percentage: 30 },
          { userId: 'user3', percentage: 25 }, // Total = 95%, no 100%
        ],
      };

      expect(() => calculateSplits(input)).toThrow('deben sumar 100%');
    });

    it('should throw error for invalid percentage', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'PERCENTAGE',
        customSplits: [
          { userId: 'user1', percentage: 150 }, // > 100%
          { userId: 'user2', percentage: 30 },
          { userId: 'user3', percentage: 20 },
        ],
      };

      expect(() => calculateSplits(input)).toThrow('Porcentaje inválido');
    });
  });

  describe('validateSplitsTotal', () => {
    it('should return true for valid total', () => {
      const splits = [
        { userId: 'user1', amount: 33.34, type: 'EQUAL' as const },
        { userId: 'user2', amount: 33.33, type: 'EQUAL' as const },
        { userId: 'user3', amount: 33.33, type: 'EQUAL' as const },
      ];

      expect(validateSplitsTotal(splits, 100)).toBe(true);
    });

    it('should return false for invalid total', () => {
      const splits = [
        { userId: 'user1', amount: 40, type: 'EXACT' as const },
        { userId: 'user2', amount: 35, type: 'EXACT' as const },
        { userId: 'user3', amount: 30, type: 'EXACT' as const },
      ];

      expect(validateSplitsTotal(splits, 100)).toBe(false);
    });

    it('should handle rounding tolerance', () => {
      const splits = [
        { userId: 'user1', amount: 33.33, type: 'EQUAL' as const },
        { userId: 'user2', amount: 33.33, type: 'EQUAL' as const },
        { userId: 'user3', amount: 33.33, type: 'EQUAL' as const },
      ];

      // 99.99 vs 100 debería ser válido (dentro de tolerancia)
      expect(validateSplitsTotal(splits, 100)).toBe(true);
    });
  });

  describe('calculateMemberBalances', () => {
    it('should calculate correct balances for multiple expenses', () => {
      const expenses = [
        {
          amount: 100,
          creatorId: 'user1',
          splits: [
            { userId: 'user1', amount: 50, type: 'EXACT' as const },
            { userId: 'user2', amount: 50, type: 'EXACT' as const },
          ],
        },
        {
          amount: 60,
          creatorId: 'user2',
          splits: [
            { userId: 'user1', amount: 30, type: 'EQUAL' as const },
            { userId: 'user2', amount: 30, type: 'EQUAL' as const },
          ],
        },
      ];

      const balances = calculateMemberBalances(expenses, ['user1', 'user2']);

      // user1: pagó 100, debe 50 + 30 = 80, balance = 100 - 80 = 20
      expect(balances.get('user1')).toBe(20);
      
      // user2: pagó 60, debe 50 + 30 = 80, balance = 60 - 80 = -20
      expect(balances.get('user2')).toBe(-20);
    });

    it('should handle member with no expenses', () => {
      const expenses = [
        {
          amount: 100,
          creatorId: 'user1',
          splits: [
            { userId: 'user1', amount: 50, type: 'EQUAL' as const },
            { userId: 'user2', amount: 50, type: 'EQUAL' as const },
          ],
        },
      ];

      const balances = calculateMemberBalances(expenses, ['user1', 'user2', 'user3']);

      expect(balances.get('user1')).toBe(50);  // pagó 100, debe 50
      expect(balances.get('user2')).toBe(-50); // pagó 0, debe 50
      expect(balances.get('user3')).toBe(0);   // no participó
    });
  });

  describe('Input validation', () => {
    it('should throw error for zero amount', () => {
      const input: SplitCalculationInput = {
        totalAmount: 0,
        currency: 'USD',
        members: mockMembers,
        splitType: 'EQUAL',
      };

      expect(() => calculateSplits(input)).toThrow('mayor a 0');
    });

    it('should throw error for negative amount', () => {
      const input: SplitCalculationInput = {
        totalAmount: -100,
        currency: 'USD',
        members: mockMembers,
        splitType: 'EQUAL',
      };

      expect(() => calculateSplits(input)).toThrow('mayor a 0');
    });

    it('should throw error for empty members', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: [],
        splitType: 'EQUAL',
      };

      expect(() => calculateSplits(input)).toThrow('al menos un miembro');
    });

    it('should throw error for duplicate member IDs', () => {
      const input: SplitCalculationInput = {
        totalAmount: 100,
        currency: 'USD',
        members: [
          { id: 'user1', name: 'Alice' },
          { id: 'user1', name: 'Alice Duplicate' }, // ID duplicado
        ],
        splitType: 'EQUAL',
      };

      expect(() => calculateSplits(input)).toThrow('únicos');
    });
  });
});
