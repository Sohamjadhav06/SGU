export type LocationType = 'warehouse' | 'store';
export type PriorityTier = 'flagship' | 'standard' | 'express';
export type StockoutRiskLevel = 'critical' | 'high' | 'moderate' | 'low' | 'none';
export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed';
export type MovementType = 'transfer' | 'inbound' | 'outbound' | 'adjustment';
export type NotificationSeverity = 'critical' | 'warning' | 'info';
export type OptimizationObjective = 'minimize_cost' | 'prevent_stockout' | 'balanced';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number; // in INR (₹)
  sellingPrice: number; // in INR (₹)
  weightKg: number;
  minSafetyStock: number;
  maxStock: number;
  leadTimeDays: number;
  isPerishable: boolean;
  expiryDate?: string;
  description: string;
  unitOfMeasure: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'warehouse';
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  totalCapacityUnits: number;
  usedCapacityUnits: number;
  operatingCostPerDay: number; // in INR (₹)
  managerName: string;
  contactPhone: string;
  status: 'active' | 'maintenance';
}

export interface Store {
  id: string;
  code: string;
  name: string;
  type: 'store';
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  priorityTier: PriorityTier;
  dailyFootfall: number;
  managerName: string;
  contactPhone: string;
  status: 'active' | 'closed';
}

export interface InventoryItem {
  id: string;
  productId: string;
  locationId: string; // Warehouse or Store ID
  locationType: LocationType;
  quantityOnHand: number;
  quantityReserved: number;
  reorderPoint: number;
  safetyStock: number;
  targetStockLevel: number;
  lastRestockedAt: string;
  batchNumber?: string;
}

export interface StockMovement {
  id: string;
  movementNumber: string;
  timestamp: string;
  productId: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  type: MovementType;
  quantity: number;
  referenceDoc: string;
  initiatedBy: string;
  status: 'completed' | 'in_transit' | 'cancelled';
  notes?: string;
}

export interface DemandRecord {
  id: string;
  productId: string;
  storeId: string;
  historicalDailyDemand: number[]; // last 14 days
  averageDailyDemand: number;
  peakDailyDemand: number;
  forecastedDemand7Days: number;
  leadTimeDays: number;
  stockoutRiskLevel: StockoutRiskLevel;
  estimatedDaysRemaining: number | null;
  stockoutAlertMessage?: string;
}

export interface RouteCost {
  id: string;
  sourceWarehouseId: string;
  destinationLocationId: string;
  distanceKm: number;
  baseCost: number; // in INR (₹)
  costPerUnit: number; // in INR (₹)
  estimatedHours: number;
  carrierName: string;
  reliabilityRate: number;
}

export interface AIExplanation {
  summary: string;
  mainReason: string;
  keyAssumptions: string[];
  limitationsAndWarnings: string[];
  humanReadableSummary: string;
  source: 'ai_engine' | 'deterministic_fallback';
  confidenceScore: number;
}

export interface RecommendationItem {
  id: string;
  productId: string;
  sourceLocationId: string;
  destinationLocationId: string;
  recommendedQuantity: number;
  estimatedCost: number; // in INR (₹)
  transitDays: number;
  reasonCodes: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  aiExplanation?: AIExplanation;
  status: 'pending' | 'approved' | 'rejected' | 'dispatched';
}

export interface UnfulfilledDemandItem {
  productId: string;
  storeId: string;
  unfulfilledUnits: number;
  reason: 'INSUFFICIENT_GLOBAL_STOCK' | 'BUDGET_EXCEEDED' | 'TRANSIT_TIME_EXCEEDED';
  potentialRevenueLoss: number; // in INR (₹)
}

export interface OptimizationSettings {
  objective: OptimizationObjective;
  budgetLimit: number; // in INR (₹)
  bufferStockMultiplier: number;
  maxTransferLeadTimeDays: number;
  selectedWarehouseIds: string[];
  selectedStoreIds: string[];
  selectedProductCategories: string[];
}

export interface OptimizationResult {
  id: string;
  runTimestamp: string;
  settings: OptimizationSettings;
  recommendations: RecommendationItem[];
  totalUnitsMoved: number;
  totalEstimatedCost: number; // in INR (₹)
  stockoutsPrevented: number;
  serviceLevelProjected: number;
  unfulfilledDemand: UnfulfilledDemandItem[];
  constraintWarnings: string[];
  baselineMetrics: {
    stockoutIncidents: number;
    totalCost: number; // in INR (₹)
    fulfillmentRate: number;
  };
  savingsAchieved: number; // in INR (₹)
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  demandMultiplier: number;
  transportCostMultiplier: number;
  budgetLimit: number;
  disruptedWarehouseId?: string;
  objective: OptimizationObjective;
  baselineMetrics: {
    stockoutsPrevented: number;
    totalCost: number;
    serviceLevel: number;
    unfulfilledUnits: number;
  };
  simulatedMetrics: {
    stockoutsPrevented: number;
    totalCost: number;
    serviceLevel: number;
    unfulfilledUnits: number;
  };
}

export interface ShipmentStatusEvent {
  timestamp: string;
  status: ShipmentStatus;
  location: string;
  notes: string;
}

export interface Shipment {
  id: string;
  shipmentCode: string;
  originId: string;
  destinationId: string;
  carrier: string;
  trackingNumber: string;
  status: ShipmentStatus;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  totalCost: number; // in INR (₹)
  statusHistory: ShipmentStatusEvent[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: 'stockout' | 'shipment' | 'optimization' | 'system';
  timestamp: string;
  read: boolean;
  linkPage?: StockWisePage;
  actionLabel?: string;
}

export interface CompanySettings {
  companyName: string;
  currency: string;
  distanceUnit: 'km';
  holdingCostRateAnnual: number;
  defaultTargetDaysSupply: number;
  defaultSafetyStockDays: number;
  defaultCarrierRatePerKm: number;
  autoOptimizeSchedule: 'manual' | 'daily' | 'weekly';
  openAiApiKey?: string;
  openAiModel: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin';
  avatarInitials: string;
}

// Canonical Page Navigation Keys
export type StockWisePage =
  // OVERVIEW
  | 'dashboard'
  // INVENTORY
  | 'products'
  | 'stock-movements'
  | 'import-data'
  // LOCATIONS
  | 'warehouses'
  | 'stores'
  // INTELLIGENCE
  | 'demand-analysis'
  | 'stockout-alerts'
  | 'excess-inventory'
  | 'redistribution-recommendations'
  // DISTRIBUTION
  | 'distribution-planner'
  | 'optimization-results'
  | 'plan-comparison'
  | 'shipments'
  // SCENARIO TESTING
  | 'simulation'
  | 'saved-scenarios'
  // REPORTS
  | 'reports'
  // SYSTEM
  | 'notifications'
  | 'settings'
  | 'help-support'
  // AUTH
  | 'login';
