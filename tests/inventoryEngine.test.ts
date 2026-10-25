import {
  calculateDaysRemaining,
  classifyStockoutRisk,
  calculateReplenishmentNeed,
  generateDeterministicExplanation,
  runDistributionOptimization,
  runScenarioSimulation,
} from '../src/lib/inventoryEngine';
import {
  MOCK_PRODUCTS,
  MOCK_WAREHOUSES,
  MOCK_STORES,
  MOCK_ROUTE_COSTS,
  createInitialInventory,
  createInitialDemandRecords,
} from '../src/data/mockStockWiseData';

console.log('--- Running StockWise AI Deterministic Engine Unit Tests ---\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failCount++;
  }
}

// 1. Days of stock remaining calculation tests
console.log('1. Testing calculateDaysRemaining (division by zero guard & accuracy)...');
assert(calculateDaysRemaining(100, 10) === 10, '100 units / 10 demand = 10.0 days');
assert(calculateDaysRemaining(15, 10) === 1.5, '15 units / 10 demand = 1.5 days');
assert(calculateDaysRemaining(6, 14.2) === 0.4, '6 units / 14.2 demand = 0.4 days (rounded)');
assert(calculateDaysRemaining(100, 0) === null, 'Guards against division by zero (returns null when demand is 0)');
assert(calculateDaysRemaining(100, -5) === null, 'Guards against negative demand (returns null)');
assert(calculateDaysRemaining(0, 10) === 0, 'Zero stock returns 0 days remaining');
assert(calculateDaysRemaining(-10, 10) === 0, 'Negative stock returns 0 days remaining');

// 2. Stockout risk classification
console.log('\n2. Testing classifyStockoutRisk...');
assert(classifyStockoutRisk(5, 30, 0.4) === 'critical', 'Days remaining <= 2.0 classified as critical');
assert(classifyStockoutRisk(30, 30, 3.2) === 'high', 'Days remaining <= 4.0 classified as high');
assert(classifyStockoutRisk(50, 30, 6.0) === 'moderate', 'Days remaining <= 7.0 classified as moderate');
assert(classifyStockoutRisk(150, 30, 15.0) === 'none', 'Days remaining > 14.0 classified as none');
assert(classifyStockoutRisk(0, 30, null) === 'critical', 'Zero stock with unmodeled demand classified as critical');
assert(classifyStockoutRisk(10, 30, null) === 'high', 'Stock below 50% safety stock with unmodeled demand classified as high');

// 3. Replenishment Need
console.log('\n3. Testing calculateReplenishmentNeed...');
const need1 = calculateReplenishmentNeed(10, 30, 14, 5); // target: max(45, 70) = 70. 70 - 10 = 60
assert(need1 === 60, 'Replenishment need calculated correctly to meet target coverage');
const need2 = calculateReplenishmentNeed(100, 30, 14, 5); // available > target -> 0
assert(need2 === 0, 'Replenishment need is 0 when stock exceeds target');

// 4. Deterministic AI explanation generator
console.log('\n4. Testing generateDeterministicExplanation...');
const exp = generateDeterministicExplanation({
  productName: 'AcousticPro ANC Headphones',
  sku: 'ELC-ANC-900',
  sourceName: 'East Coast DC',
  destName: 'Metro NYC Flagship',
  quantity: 50,
  cost: 72.0,
  destDaysRemaining: 0.4,
  destCurrentStock: 6,
  sourceAvailableStock: 500,
  sourceSafetyStock: 120,
  reasonCodes: ['CRITICAL_STOCKOUT_PREVENTION', 'SOURCE_SAFETY_STOCK_PROTECTED'],
});
assert(Boolean(exp.summary && exp.summary.includes('50 units')), 'Explanation contains recommended transfer quantity');
assert(Boolean(exp.mainReason && exp.mainReason.includes('0.4 days')), 'Explanation contains destination burn telemetry');
assert(exp.keyAssumptions.length >= 2, 'Key assumptions included');
assert(exp.source === 'deterministic_fallback', 'Source verified as deterministic engine');

// 5. Run Full Distribution Optimization Solver
console.log('\n5. Testing runDistributionOptimization deterministic solver...');
const initialInventory = createInitialInventory();
const demandRecords = createInitialDemandRecords();

const optResult = runDistributionOptimization({
  inventory: initialInventory,
  products: MOCK_PRODUCTS,
  warehouses: MOCK_WAREHOUSES,
  stores: MOCK_STORES,
  demandRecords,
  routeCosts: MOCK_ROUTE_COSTS,
  settings: {
    objective: 'balanced',
    budgetLimit: 50000,
    bufferStockMultiplier: 1.2,
    maxTransferLeadTimeDays: 7,
    selectedWarehouseIds: MOCK_WAREHOUSES.map((w) => w.id),
    selectedStoreIds: MOCK_STORES.map((s) => s.id),
    selectedProductCategories: [],
  },
});

assert(optResult.recommendations.length > 0, `Generated ${optResult.recommendations.length} feasible recommendations`);
assert(optResult.stockoutsPrevented >= 6, `Averted ${optResult.stockoutsPrevented} stockouts`);
assert(optResult.totalEstimatedCost > 0 && optResult.totalEstimatedCost <= 50000, `Total cost $${optResult.totalEstimatedCost} within $50,000 budget`);
assert(optResult.savingsAchieved > 0, `Savings achieved ($${optResult.savingsAchieved}) calculated from baseline`);

// 6. Test Scenario Simulation
console.log('\n6. Testing runScenarioSimulation...');
const simResult = runScenarioSimulation({
  inventory: initialInventory,
  products: MOCK_PRODUCTS,
  warehouses: MOCK_WAREHOUSES,
  stores: MOCK_STORES,
  demandRecords,
  routeCosts: MOCK_ROUTE_COSTS,
  scenario: {
    id: 'test-sim',
    name: 'Demand Surge Test',
    description: 'Testing +30% demand',
    createdAt: new Date().toISOString(),
    demandMultiplier: 1.3,
    transportCostMultiplier: 1.2,
    budgetLimit: 60000,
    objective: 'prevent_stockout',
    baselineMetrics: {
      stockoutsPrevented: optResult.stockoutsPrevented,
      totalCost: optResult.totalEstimatedCost,
      serviceLevel: optResult.serviceLevelProjected,
      unfulfilledUnits: 0,
    },
    simulatedMetrics: {
      stockoutsPrevented: 0,
      totalCost: 0,
      serviceLevel: 0,
      unfulfilledUnits: 0,
    },
  },
});

assert(simResult.simulatedMetrics.totalCost > 0, `Simulated total cost calculated: $${simResult.simulatedMetrics.totalCost}`);
assert(simResult.simulatedMetrics.serviceLevel > 0, `Simulated service level calculated: ${simResult.simulatedMetrics.serviceLevel}%`);

console.log(`\n--- Test Results: ${passCount} Passed, ${failCount} Failed ---`);
if (failCount > 0) process.exit(1);
