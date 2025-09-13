import { 
  ExpenseMember, 
  ExpenseSplit, 
  SplitType, 
  SplitCalculationInput, 
  SplitCalculationResult,
  ValidationError,
  CalculationError 
} from './types';

/**
 * Calculadora de divisiones de gastos
 * Implementa diferentes algoritmos de división: equitativa, exacta y por porcentaje
 */

/**
 * Calcular divisiones de un gasto
 * Función principal que maneja todos los tipos de división
 */
export function calculateSplits(input: SplitCalculationInput): SplitCalculationResult {
  validateSplitInput(input);

  switch (input.splitType) {
    case 'EQUAL':
      return calculateEqualSplits(input);
    case 'EXACT':
      return calculateExactSplits(input);
    case 'PERCENTAGE':
      return calculatePercentageSplits(input);
    default:
      throw new ValidationError(`Tipo de división no soportado: ${input.splitType}`);
  }
}

/**
 * Validar entrada para cálculo de splits
 */
function validateSplitInput(input: SplitCalculationInput): void {
  if (input.totalAmount <= 0) {
    throw new ValidationError('El monto total debe ser mayor a 0');
  }

  if (input.members.length === 0) {
    throw new ValidationError('Debe haber al menos un miembro');
  }

  // Verificar IDs únicos
  const memberIds = input.members.map(m => m.id);
  const uniqueIds = new Set(memberIds);
  if (memberIds.length !== uniqueIds.size) {
    throw new ValidationError('Los IDs de miembros deben ser únicos');
  }

  // Validaciones específicas por tipo
  if (input.splitType === 'EXACT' || input.splitType === 'PERCENTAGE') {
    if (!input.customSplits || input.customSplits.length === 0) {
      throw new ValidationError(`Para división ${input.splitType} se requieren splits personalizados`);
    }

    // Verificar que todos los miembros tengan un split personalizado
    const customSplitIds = new Set(input.customSplits.map(s => s.userId));
    const memberIdsSet = new Set(memberIds);
    
    if (customSplitIds.size !== memberIdsSet.size || 
        ![...customSplitIds].every(id => memberIdsSet.has(id))) {
      throw new ValidationError('Todos los miembros deben tener un split personalizado');
    }
  }
}

/**
 * Calcular división equitativa
 * Divide el monto total equitativamente entre todos los miembros
 */
function calculateEqualSplits(input: SplitCalculationInput): SplitCalculationResult {
  const { totalAmount, members } = input;
  const memberCount = members.length;
  
  // Calcular monto base por persona
  const baseAmount = Math.floor((totalAmount * 100) / memberCount) / 100;
  
  // Calcular remainder (diferencia por redondeo)
  const totalAllocated = baseAmount * memberCount;
  const remainder = Math.round((totalAmount - totalAllocated) * 100) / 100;
  
  // Distribuir el remainder entre los primeros miembros (centavos)
  const remainderCents = Math.round(remainder * 100);
  
  const splits: ExpenseSplit[] = members.map((member, index) => {
    let amount = baseAmount;
    
    // Agregar un centavo a los primeros miembros si hay remainder
    if (index < remainderCents) {
      amount += 0.01;
    }
    
    return {
      userId: member.id,
      amount: Math.round(amount * 100) / 100,
      type: 'EQUAL',
    };
  });

  return {
    splits,
    totalAllocated: totalAmount,
    remainder: 0, // Siempre 0 para división equitativa
  };
}

/**
 * Calcular división exacta
 * Cada miembro paga un monto específico
 */
function calculateExactSplits(input: SplitCalculationInput): SplitCalculationResult {
  const { totalAmount, members, customSplits } = input;
  
  if (!customSplits) {
    throw new CalculationError('Se requieren montos exactos para división EXACT');
  }

  const splits: ExpenseSplit[] = [];
  let totalAllocated = 0;

  for (const member of members) {
    const customSplit = customSplits.find(s => s.userId === member.id);
    
    if (!customSplit || customSplit.amount === undefined) {
      throw new ValidationError(`Monto requerido para miembro ${member.name}`);
    }

    if (customSplit.amount < 0) {
      throw new ValidationError(`El monto no puede ser negativo para ${member.name}`);
    }

    const amount = Math.round(customSplit.amount * 100) / 100;
    totalAllocated += amount;

    splits.push({
      userId: member.id,
      amount,
      type: 'EXACT',
    });
  }

  totalAllocated = Math.round(totalAllocated * 100) / 100;
  const remainder = Math.round((totalAmount - totalAllocated) * 100) / 100;

  // Validar que la suma no exceda el total (con tolerancia)
  if (Math.abs(remainder) > 0.01) {
    throw new CalculationError(
      `La suma de montos exactos (${totalAllocated}) no coincide con el total (${totalAmount}). Diferencia: ${remainder}`
    );
  }

  return {
    splits,
    totalAllocated,
    remainder,
  };
}

/**
 * Calcular división por porcentaje
 * Cada miembro paga un porcentaje específico del total
 */
function calculatePercentageSplits(input: SplitCalculationInput): SplitCalculationResult {
  const { totalAmount, members, customSplits } = input;
  
  if (!customSplits) {
    throw new CalculationError('Se requieren porcentajes para división PERCENTAGE');
  }

  // Validar porcentajes
  let totalPercentage = 0;
  const memberPercentages = new Map<string, number>();

  for (const member of members) {
    const customSplit = customSplits.find(s => s.userId === member.id);
    
    if (!customSplit || customSplit.percentage === undefined) {
      throw new ValidationError(`Porcentaje requerido para miembro ${member.name}`);
    }

    if (customSplit.percentage < 0 || customSplit.percentage > 100) {
      throw new ValidationError(`Porcentaje inválido para ${member.name}: ${customSplit.percentage}%`);
    }

    totalPercentage += customSplit.percentage;
    memberPercentages.set(member.id, customSplit.percentage);
  }

  // Validar que los porcentajes sumen 100% (con tolerancia)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new ValidationError(`Los porcentajes deben sumar 100%. Total actual: ${totalPercentage}%`);
  }

  // Calcular montos
  const splits: ExpenseSplit[] = [];
  let totalAllocated = 0;

  for (const member of members) {
    const percentage = memberPercentages.get(member.id)!;
    const amount = Math.round((totalAmount * percentage / 100) * 100) / 100;
    
    totalAllocated += amount;

    splits.push({
      userId: member.id,
      amount,
      type: 'PERCENTAGE',
      percentage,
    });
  }

  totalAllocated = Math.round(totalAllocated * 100) / 100;
  const remainder = Math.round((totalAmount - totalAllocated) * 100) / 100;

  // Si hay remainder por redondeo, ajustar el split del primer miembro
  if (Math.abs(remainder) > 0) {
    splits[0]!.amount = Math.round((splits[0]!.amount + remainder) * 100) / 100;
    totalAllocated = totalAmount;
  }

  return {
    splits,
    totalAllocated,
    remainder: 0,
  };
}

/**
 * Validar que los splits sumen el total esperado
 */
export function validateSplitsTotal(splits: ExpenseSplit[], expectedTotal: number): boolean {
  const actualTotal = splits.reduce((sum, split) => sum + split.amount, 0);
  const roundedActual = Math.round(actualTotal * 100) / 100;
  const roundedExpected = Math.round(expectedTotal * 100) / 100;
  
  return Math.abs(roundedActual - roundedExpected) <= 0.01;
}

/**
 * Obtener resumen de un split
 */
export function getSplitSummary(splits: ExpenseSplit[], members: ExpenseMember[]) {
  const memberMap = new Map(members.map(m => [m.id, m]));
  
  return splits.map(split => {
    const member = memberMap.get(split.userId);
    return {
      userId: split.userId,
      userName: member?.name || 'Usuario desconocido',
      amount: split.amount,
      type: split.type,
      percentage: split.percentage,
    };
  });
}

/**
 * Calcular el monto que cada miembro debe pagar vs lo que pagó
 * Útil para calcular balances en un grupo
 */
export function calculateMemberBalances(
  expenses: Array<{
    amount: number;
    creatorId: string;
    splits: ExpenseSplit[];
  }>,
  memberIds: string[]
): Map<string, number> {
  const balances = new Map<string, number>();
  
  // Inicializar balances en 0
  memberIds.forEach(id => balances.set(id, 0));
  
  expenses.forEach(expense => {
    // El creador pagó el total del gasto
    const creatorBalance = balances.get(expense.creatorId) || 0;
    balances.set(expense.creatorId, creatorBalance + expense.amount);
    
    // Cada miembro debe su parte del split
    expense.splits.forEach(split => {
      const memberBalance = balances.get(split.userId) || 0;
      balances.set(split.userId, memberBalance - split.amount);
    });
  });
  
  // Redondear balances
  balances.forEach((balance, userId) => {
    balances.set(userId, Math.round(balance * 100) / 100);
  });
  
  return balances;
}
