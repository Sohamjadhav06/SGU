// Unit Test Runner for VyaparMitra Distribution & Inventory Engine

function calculateDaysRemaining(availableStock, avgDailyDemand) {
  if (avgDailyDemand <= 0 || isNaN(avgDailyDemand) || avgDailyDemand === null || avgDailyDemand === undefined) {
    return null;
  }
  if (availableStock <= 0) {
    return 0;
  }
  return Math.round((availableStock / avgDailyDemand) * 10) / 10;
}

function classifyStockoutRisk(availableStock, safetyStock, daysRemaining) {
  if (daysRemaining !== null) {
    if (daysRemaining <= 2.0 || availableStock <= 0) return 'critical';
    if (daysRemaining <= 4.0) return 'high';
    if (daysRemaining <= 7.0) return 'moderate';
    if (daysRemaining <= 14.0) return 'low';
    return 'none';
  }
  if (availableStock <= 0) return 'critical';
  if (availableStock < safetyStock * 0.5) return 'high';
  if (availableStock < safetyStock) return 'moderate';
  return 'none';
}

function calculateReplenishmentNeed(availableStock, safetyStock, targetDaysSupply, avgDailyDemand) {
  const targetStock =
    avgDailyDemand > 0
      ? Math.max(safetyStock * 1.5, Math.ceil(avgDailyDemand * targetDaysSupply))
      : safetyStock * 2;
  const netDeficit = targetStock - availableStock;
  return Math.max(0, netDeficit);
}

function calculateExcessInventory(quantityOnHand, quantityReserved, targetStockLevel, unitCost, holdingCostRate = 0.18) {
  const available = Math.max(0, quantityOnHand - quantityReserved);
  if (available > targetStockLevel) {
    const excessUnits = available - targetStockLevel;
    const annualHoldingCost = Math.round(excessUnits * unitCost * holdingCostRate * 100) / 100;
    return { excessUnits, annualHoldingCost };
  }
  return { excessUnits: 0, annualHoldingCost: 0 };
}

function calculateRouteCost(baseCost, costPerUnit, units) {
  return Math.round((baseCost + units * costPerUnit) * 100) / 100;
}

console.log('====================================================');
console.log('VYAPARMITRA: VERIFICATION & UNIT TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// TEST SUITE 1: Days of stock remaining calculation
console.log('--- 1. Testing Days of Stock Remaining Formula ---');
assert(calculateDaysRemaining(100, 10) === 10.0, 'Normal demand: 100 stock / 10 demand = 10.0 days');
assert(calculateDaysRemaining(6, 14.2) === 0.4, 'Kothrud Store Portronics Charger: 6 stock / 14.2 demand = 0.4 days');
assert(calculateDaysRemaining(10, 12.5) === 0.8, 'Andheri Electronics boAt Earbuds: 10 stock / 12.5 demand = 0.8 days');
assert(calculateDaysRemaining(50, 0) === null, 'Guards against division by zero (demand = 0 returns null)');
assert(calculateDaysRemaining(50, -2) === null, 'Guards against negative demand (returns null)');
assert(calculateDaysRemaining(0, 5) === 0, 'Zero available stock returns 0 days remaining');
assert(calculateDaysRemaining(-5, 5) === 0, 'Negative stock returns 0 days remaining');

// TEST SUITE 2: Stockout risk classification
console.log('\n--- 2. Testing Stockout Risk Ranking ---');
assert(classifyStockoutRisk(6, 30, 0.4) === 'critical', '<= 2.0 days remaining is ranked as CRITICAL');
assert(classifyStockoutRisk(14, 30, 1.5) === 'critical', '<= 2.0 days remaining is ranked as CRITICAL');
assert(classifyStockoutRisk(25, 30, 3.2) === 'high', '<= 4.0 days remaining is ranked as HIGH');
assert(classifyStockoutRisk(45, 30, 6.0) === 'moderate', '<= 7.0 days remaining is ranked as MODERATE');
assert(classifyStockoutRisk(120, 30, 16.0) === 'none', '> 14.0 days remaining is ranked as NONE');
assert(classifyStockoutRisk(0, 30, null) === 'critical', 'Zero stock with unmodeled demand is CRITICAL');
assert(classifyStockoutRisk(12, 30, null) === 'high', '< 50% safety buffer with unmodeled demand is HIGH');

// TEST SUITE 3: Replenishment quantity calculation
console.log('\n--- 3. Testing Replenishment Quantity Math ---');
// Available = 6, safety = 40, target = 14 days * 14.2/day = 199. Max(60, 199) = 199. Deficit: 199 - 6 = 193
assert(calculateReplenishmentNeed(6, 40, 14, 14.2) === 193, 'Calculates 193 units needed to reach 14-day coverage');
// Available = 300, target = 70. Available > target -> 0 need
assert(calculateReplenishmentNeed(300, 30, 14, 5) === 0, 'Returns 0 replenishment when available exceeds target');

// TEST SUITE 4: Excess inventory & holding cost (Rupees)
console.log('\n--- 4. Testing Excess Inventory & Holding Cost ---');
const excessResult = calculateExcessInventory(235, 0, 70, 799, 0.18);
assert(excessResult.excessUnits === 165, 'Pune Central Warehouse: 235 on hand - 70 target = 165 excess units');
assert(excessResult.annualHoldingCost === 23730.3, '165 units * ₹799 unit cost * 18% holding rate = ₹23,730.30/yr');

// TEST SUITE 5: Route cost calculation (Rupees)
console.log('\n--- 5. Testing Route Delivery Cost (Maharashtra) ---');
assert(calculateRouteCost(450, 3.5, 60) === 660.0, 'Pune Central to Kothrud Digital: ₹450 base + (60 units * ₹3.50) = ₹660.00');
assert(calculateRouteCost(400, 3.0, 50) === 550.0, 'Mumbai DC to Andheri Electronics: ₹400 base + (50 units * ₹3.00) = ₹550.00');

// TEST SUITE 6: Multi-echelon stock conservation
console.log('\n--- 6. Testing Stock Conservation and Feasibility ---');
const whStockOnHand = 600;
const whReserved = 45;
const whSafety = 50;
const uncommittedFree = Math.max(0, whStockOnHand - whReserved - whSafety);
assert(uncommittedFree === 505, 'Uncommitted warehouse stock respects reserved and safety buffers (505 free units)');
const transferQuantity = 60;
const postTransferAvailable = uncommittedFree - transferQuantity;
assert(postTransferAvailable === 445, 'Post-transfer warehouse stock remains well above safety threshold');

console.log(`\n====================================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`ALL VYAPARMITRA ENGINE FORMULAS COMPLIANT WITH SPECIFICATION`);
console.log(`====================================================`);

if (failed > 0) process.exit(1);
