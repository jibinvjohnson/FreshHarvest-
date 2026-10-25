export interface VarianceCalculationResult {
  expected_quantity: number;
  actual_quantity: number;
  variance_quantity: number;
  variance_percentage: number;
  is_shortfall: boolean;
  is_surplus: boolean;
  is_exact: boolean;
  outcome_label: 'Shortfall' | 'Surplus' | 'Exact Match';
}

/**
 * Calculates variance and variance percentage between expected and actual harvest.
 * Formula:
 *   Variance = Actual Quantity - Expected Quantity
 *   Variance Percentage = ((Actual Quantity - Expected Quantity) / Expected Quantity) * 100
 */
export function calculateHarvestVariance(
  expectedQuantity: number,
  actualQuantity: number
): VarianceCalculationResult {
  if (expectedQuantity < 0 || actualQuantity < 0) {
    throw new Error('Quantities cannot be negative.');
  }

  const varianceQuantity = Number((actualQuantity - expectedQuantity).toFixed(2));
  let variancePercentage = 0;

  if (expectedQuantity === 0) {
    variancePercentage = actualQuantity > 0 ? 100 : 0;
  } else {
    variancePercentage = Number((((actualQuantity - expectedQuantity) / expectedQuantity) * 100).toFixed(2));
  }

  const is_shortfall = varianceQuantity < 0;
  const is_surplus = varianceQuantity > 0;
  const is_exact = varianceQuantity === 0;

  let outcome_label: 'Shortfall' | 'Surplus' | 'Exact Match' = 'Exact Match';
  if (is_shortfall) outcome_label = 'Shortfall';
  else if (is_surplus) outcome_label = 'Surplus';

  return {
    expected_quantity: expectedQuantity,
    actual_quantity: actualQuantity,
    variance_quantity: varianceQuantity,
    variance_percentage: variancePercentage,
    is_shortfall,
    is_surplus,
    is_exact,
    outcome_label,
  };
}

export interface FarmerReliabilityMetric {
  farmer_id: string;
  farmer_name: string;
  total_commitments: number;
  total_harvested_batches: number;
  total_expected_kg: number;
  total_actual_kg: number;
  overall_variance_kg: number;
  overall_variance_pct: number;
  shortfall_count: number;
  surplus_count: number;
  exact_count: number;
  reliability_score: number; // percentage of harvest within +/- 15% tolerance
}
