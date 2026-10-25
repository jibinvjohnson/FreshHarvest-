import { dbRepository } from '@/lib/db/repository';

export interface DashboardMetrics {
  totalFarmers: number;
  activeFarms: number;
  activeProducts: number;
  upcomingHarvests: number;
  totalExpectedQuantity: number;
  totalActualQuantity: number;
  overallVarianceQuantity: number;
  pendingPreOrdersCount: number;
  pendingPreOrdersDemand: number;
  availableStockTotal: number;
  totalAllocationShortage: number;
  surplusAwaitingRescue: number;
  surplusActiveCount: number;
  recentOrdersCount: number;
  totalRevenue: number;
}

export interface HarvestComparisonChartItem {
  name: string;
  expected: number;
  actual: number;
  variance: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    farmers,
    farms,
    products,
    expectedHarvests,
    harvestBatches,
    preOrders,
    orders,
    surplusListings,
  ] = await Promise.all([
    dbRepository.getFarmers(),
    dbRepository.getFarms(),
    dbRepository.getProducts(),
    dbRepository.getExpectedHarvests(),
    dbRepository.getHarvestBatches(),
    dbRepository.getPreOrders(),
    dbRepository.getOrders(),
    dbRepository.getSurplusListings(),
  ]);

  const activeProducts = products.filter((p) => p.is_active).length;
  const upcomingHarvests = expectedHarvests.filter((eh) => eh.forecast_status === 'Active').length;

  const totalExpectedQuantity = expectedHarvests.reduce((sum, eh) => sum + eh.expected_quantity, 0);
  const totalActualQuantity = harvestBatches.reduce((sum, hb) => sum + hb.quantity, 0);
  const overallVarianceQuantity = Number((totalActualQuantity - totalExpectedQuantity).toFixed(2));

  const pendingPreOrders = preOrders.filter((po) => po.status === 'Pending' || po.status === 'Partially Allocated');
  const pendingPreOrdersCount = pendingPreOrders.length;
  const pendingPreOrdersDemand = pendingPreOrders.reduce((sum, po) => sum + (po.requested_quantity - po.allocated_quantity), 0);

  const availableStockTotal = harvestBatches.reduce((sum, hb) => sum + hb.available_quantity, 0);

  // Shortage: unfulfilled pre-orders where requested > allocated
  const totalAllocationShortage = preOrders.reduce((sum, po) => {
    return sum + Math.max(0, po.requested_quantity - po.allocated_quantity);
  }, 0);

  const activeSurplus = surplusListings.filter((sl) => sl.status === 'Active' && new Date(sl.sale_deadline) > new Date());
  const surplusAwaitingRescue = activeSurplus.reduce((sum, sl) => sum + (sl.quantity_listed - sl.quantity_sold), 0);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return {
    totalFarmers: farmers.length,
    activeFarms: farms.length,
    activeProducts,
    upcomingHarvests,
    totalExpectedQuantity: Number(totalExpectedQuantity.toFixed(2)),
    totalActualQuantity: Number(totalActualQuantity.toFixed(2)),
    overallVarianceQuantity,
    pendingPreOrdersCount,
    pendingPreOrdersDemand: Number(pendingPreOrdersDemand.toFixed(2)),
    availableStockTotal: Number(availableStockTotal.toFixed(2)),
    totalAllocationShortage: Number(totalAllocationShortage.toFixed(2)),
    surplusAwaitingRescue: Number(surplusAwaitingRescue.toFixed(2)),
    surplusActiveCount: activeSurplus.length,
    recentOrdersCount: orders.length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
  };
}

export async function getHarvestChartData(): Promise<HarvestComparisonChartItem[]> {
  const [expectedHarvests, variances, batches, products] = await Promise.all([
    dbRepository.getExpectedHarvests(),
    dbRepository.getHarvestVariances(),
    dbRepository.getHarvestBatches(),
    dbRepository.getProducts(),
  ]);

  return expectedHarvests.map((eh) => {
    const prod = products.find((p) => p.product_id === eh.product_id);
    const variance = variances.find((v) => v.expected_harvest_id === eh.expected_harvest_id);
    const batch = variance ? batches.find((b) => b.harvest_id === variance.harvest_id) : null;

    const actual = batch ? batch.quantity : 0;
    return {
      name: prod?.product_name || 'Crop',
      expected: eh.expected_quantity,
      actual,
      variance: Number((actual - eh.expected_quantity).toFixed(2)),
    };
  });
}
