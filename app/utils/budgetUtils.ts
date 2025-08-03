// Budget utility functions for parsing and comparing budget values

export type BudgetRange = {
  min: number;
  max: number;
};

export type BudgetInfo = {
  range: BudgetRange | null;
  isCustom: boolean;
  originalValue: string;
};

/**
 * Parse budget string into a usable format for comparison
 * Handles ranges like "$2,000 - $5,000" and custom values like "$10,000"
 */
export function parseBudget(budgetStr: string): BudgetInfo {
  if (!budgetStr || budgetStr.trim() === '') {
    return {
      range: null,
      isCustom: false,
      originalValue: budgetStr,
    };
  }

  const trimmed = budgetStr.trim();

  // Handle preset budget options
  const presetRanges: Record<string, BudgetRange> = {
    '$2,000 - $5,000': { min: 2000, max: 5000 },
    '$5,000 - $15,000': { min: 5000, max: 15000 },
    '$15,000 - $50,000': { min: 15000, max: 50000 },
  };

  if (presetRanges[trimmed]) {
    return {
      range: presetRanges[trimmed],
      isCustom: false,
      originalValue: trimmed,
    };
  }

  // Handle range format like "$X - $Y" or "$X-$Y"
  const rangeMatch = trimmed.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1].replace(/,/g, ''));
    const max = parseFloat(rangeMatch[2].replace(/,/g, ''));
    if (!isNaN(min) && !isNaN(max)) {
      return {
        range: { min, max },
        isCustom: true,
        originalValue: trimmed,
      };
    }
  }

  // Handle single value like "$10,000" or "10000"
  const singleMatch = trimmed.match(/\$?([\d,]+)/);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1].replace(/,/g, ''));
    if (!isNaN(value)) {
      return {
        range: { min: value, max: value },
        isCustom: true,
        originalValue: trimmed,
      };
    }
  }

  // If we can't parse it, return null range
  return {
    range: null,
    isCustom: true,
    originalValue: trimmed,
  };
}

/**
 * Determine if a cost exceeds the budget
 */
export function isOverBudget(cost: number, budgetInfo: BudgetInfo): boolean {
  if (!budgetInfo.range) {
    return false; // No budget defined, so nothing is over budget
  }

  return cost > budgetInfo.range.max;
}

/**
 * Calculate how much of the budget has been used by items up to a certain index
 */
export function getBudgetUsage(breakdown: Array<{ cost: number }>, upToIndex: number, budgetInfo: BudgetInfo): {
  usedAmount: number;
  remainingAmount: number;
  percentageUsed: number;
} {
  if (!budgetInfo.range) {
    return {
      usedAmount: 0,
      remainingAmount: 0,
      percentageUsed: 0,
    };
  }

  const usedAmount = breakdown
    .slice(0, upToIndex + 1)
    .reduce((sum, item) => sum + item.cost, 0);

  const remainingAmount = Math.max(0, budgetInfo.range.max - usedAmount);
  const percentageUsed = (usedAmount / budgetInfo.range.max) * 100;

  return {
    usedAmount,
    remainingAmount,
    percentageUsed,
  };
}

/**
 * Get cumulative cost up to a specific breakdown item
 */
export function getCumulativeCost(breakdown: Array<{ cost: number }>, upToIndex: number): number {
  return breakdown
    .slice(0, upToIndex + 1)
    .reduce((sum, item) => sum + item.cost, 0);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}