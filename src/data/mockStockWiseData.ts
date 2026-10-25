import type {
  Product,
  Warehouse,
  Store,
  InventoryItem,
  RouteCost,
  StockMovement,
  Shipment,
  SimulationScenario,
  NotificationItem,
  CompanySettings,
  UserProfile,
} from '../types/stockwise';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'VyaparMitra Supply Network',
  currency: 'INR (₹)',
  distanceUnit: 'km',
  holdingCostRateAnnual: 0.18, // 18% annual capital holding cost
  defaultTargetDaysSupply: 21,
  defaultSafetyStockDays: 7,
  defaultCarrierRatePerKm: 12.0, // ₹12 per km base rate
  autoOptimizeSchedule: 'daily',
  openAiApiKey: '',
  openAiModel: 'gpt-4o-mini',
};

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr-admin-01',
  name: 'Soham Jadhav',
  email: 'Admin@gmail.com',
  role: 'Admin',
  avatarInitials: 'SJ',
};

// 3 Central Warehouses in Maharashtra
export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-pune',
    code: 'WH-PUN-01',
    name: 'Pune Central Warehouse',
    type: 'warehouse',
    address: 'Plot 42, MIDC Bhosari Industrial Area',
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.6279,
    lng: 73.8344,
    totalCapacityUnits: 50000,
    usedCapacityUnits: 34200,
    operatingCostPerDay: 8500, // ₹8,500/day
    managerName: 'Suresh Patil',
    contactPhone: '+91 98220 12345',
    status: 'active',
  },
  {
    id: 'wh-mumbai',
    code: 'WH-MUM-02',
    name: 'Mumbai Distribution Centre',
    type: 'warehouse',
    address: 'Building B3, Logistics Park, Bhiwandi',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.2967,
    lng: 73.0631,
    totalCapacityUnits: 65000,
    usedCapacityUnits: 48900,
    operatingCostPerDay: 12400, // ₹12,400/day
    managerName: 'Rajesh Sharma',
    contactPhone: '+91 98200 54321',
    status: 'active',
  },
  {
    id: 'wh-nagpur',
    code: 'WH-NGP-03',
    name: 'Nagpur Storage Hub',
    type: 'warehouse',
    address: 'Sector 18, MIHAN SEZ Cargo Complex',
    city: 'Nagpur',
    state: 'Maharashtra',
    lat: 21.0607,
    lng: 79.0558,
    totalCapacityUnits: 45000,
    usedCapacityUnits: 27500,
    operatingCostPerDay: 6800, // ₹6,800/day
    managerName: 'Anil Deshmukh',
    contactPhone: '+91 97650 98765',
    status: 'active',
  },
];

// 6 Retail Stores in Maharashtra
export const MOCK_STORES: Store[] = [
  {
    id: 'str-pune-shivaji',
    code: 'STR-PUN-101',
    name: 'Shivaji Nagar Electronics',
    type: 'store',
    address: 'FC Road, Shivaji Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.5314,
    lng: 73.8446,
    priorityTier: 'flagship',
    dailyFootfall: 1450,
    managerName: 'Pooja Kulkarni',
    contactPhone: '+91 98221 44556',
    status: 'active',
  },
  {
    id: 'str-pune-kothrud',
    code: 'STR-PUN-102',
    name: 'Kothrud Digital Store',
    type: 'store',
    address: 'Paud Road, Near Vanaz Corner, Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.5074,
    lng: 73.8077,
    priorityTier: 'standard',
    dailyFootfall: 980,
    managerName: 'Nitin Joshi',
    contactPhone: '+91 98222 33445',
    status: 'active',
  },
  {
    id: 'str-mumbai-andheri',
    code: 'STR-MUM-103',
    name: 'Andheri Electronics',
    type: 'store',
    address: 'SV Road, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.1197,
    lng: 72.8464,
    priorityTier: 'flagship',
    dailyFootfall: 2100,
    managerName: 'Vikas Mehta',
    contactPhone: '+91 98201 11223',
    status: 'active',
  },
  {
    id: 'str-thane',
    code: 'STR-THA-104',
    name: 'Thane Smart Retail',
    type: 'store',
    address: 'Gokhale Road, Naupada',
    city: 'Thane',
    state: 'Maharashtra',
    lat: 19.186,
    lng: 72.9759,
    priorityTier: 'standard',
    dailyFootfall: 1200,
    managerName: 'Kunal Sawant',
    contactPhone: '+91 98202 99887',
    status: 'active',
  },
  {
    id: 'str-nashik',
    code: 'STR-NSK-105',
    name: 'Nashik Tech Mart',
    type: 'store',
    address: 'College Road, Model Colony',
    city: 'Nashik',
    state: 'Maharashtra',
    lat: 19.9975,
    lng: 73.7898,
    priorityTier: 'standard',
    dailyFootfall: 850,
    managerName: 'Girish Shinde',
    contactPhone: '+91 98230 77665',
    status: 'active',
  },
  {
    id: 'str-nagpur-dharampeth',
    code: 'STR-NGP-106',
    name: 'Dharampeth Digital Store',
    type: 'store',
    address: 'West High Court Road, Dharampeth',
    city: 'Nagpur',
    state: 'Maharashtra',
    lat: 21.1458,
    lng: 79.0669,
    priorityTier: 'express',
    dailyFootfall: 1100,
    managerName: 'Sachin Wankhede',
    contactPhone: '+91 97651 22334',
    status: 'active',
  },
];

// Exactly the 6 specified demonstration products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prd-boat-air',
    sku: 'BOAT-AIR-141',
    name: 'boAt Airdopes Earbuds',
    category: 'Audio & Wearables',
    unitCost: 750,
    sellingPrice: 1499,
    weightKg: 0.15,
    minSafetyStock: 15,
    maxStock: 120,
    leadTimeDays: 2,
    isPerishable: false,
    description: 'True wireless stereo earbuds with 42-hour battery life and ASAP charge technology.',
    unitOfMeasure: 'Units',
  },
  {
    id: 'prd-port-chr',
    sku: 'PORT-CHR-33W',
    name: 'Portronics USB-C Charger',
    category: 'Chargers & Cables',
    unitCost: 350,
    sellingPrice: 799,
    weightKg: 0.12,
    minSafetyStock: 25,
    maxStock: 180,
    leadTimeDays: 2,
    isPerishable: false,
    description: '33W fast wall power adapter with Power Delivery support for smartphones and tablets.',
    unitOfMeasure: 'Units',
  },
  {
    id: 'prd-logi-mse',
    sku: 'LOGI-M170-WL',
    name: 'Logitech Wireless Mouse',
    category: 'Computer Accessories',
    unitCost: 320,
    sellingPrice: 699,
    weightKg: 0.18,
    minSafetyStock: 20,
    maxStock: 140,
    leadTimeDays: 3,
    isPerishable: false,
    description: 'Compact wireless optical mouse with plug-and-play USB receiver and 12-month battery life.',
    unitOfMeasure: 'Units',
  },
  {
    id: 'prd-zeb-kbd',
    sku: 'ZEB-K20-USB',
    name: 'Zebronics Keyboard',
    category: 'Computer Accessories',
    unitCost: 400,
    sellingPrice: 899,
    weightKg: 0.55,
    minSafetyStock: 18,
    maxStock: 100,
    leadTimeDays: 3,
    isPerishable: false,
    description: 'Full-size ergonomic multimedia USB desktop keyboard with spill-resistant design.',
    unitOfMeasure: 'Units',
  },
  {
    id: 'prd-amb-pwb',
    sku: 'AMB-PWB-20K',
    name: 'Ambrane Power Bank',
    category: 'Mobile Accessories',
    unitCost: 600,
    sellingPrice: 1299,
    weightKg: 0.42,
    minSafetyStock: 20,
    maxStock: 120,
    leadTimeDays: 2,
    isPerishable: false,
    description: '20000mAh 22.5W fast-charging power bank with dual USB and Type-C two-way output.',
    unitOfMeasure: 'Units',
  },
  {
    id: 'prd-tpl-rtr',
    sku: 'TPL-WR841N',
    name: 'TP-Link Wi-Fi Router',
    category: 'Networking',
    unitCost: 900,
    sellingPrice: 1799,
    weightKg: 0.48,
    minSafetyStock: 12,
    maxStock: 80,
    leadTimeDays: 4,
    isPerishable: false,
    description: '300Mbps high-gain multi-antenna wireless N router for home and office broadband.',
    unitOfMeasure: 'Units',
  },
];

// 18 Route Costs Matrix (3 Warehouses x 6 Stores) with realistic Maharashtra delivery economics
export const MOCK_ROUTE_COSTS: RouteCost[] = [
  // From Pune Central Warehouse
  { id: 'rt-pune-shivaji', sourceWarehouseId: 'wh-pune', destinationLocationId: 'str-pune-shivaji', distanceKm: 14, baseCost: 80, costPerUnit: 2.5, estimatedHours: 2, carrierName: 'Pune City Express Delivery', reliabilityRate: 0.99 },
  { id: 'rt-pune-kothrud', sourceWarehouseId: 'wh-pune', destinationLocationId: 'str-pune-kothrud', distanceKm: 18, baseCost: 80, costPerUnit: 2.5, estimatedHours: 2, carrierName: 'Pune City Express Delivery', reliabilityRate: 0.99 },
  { id: 'rt-pune-andheri', sourceWarehouseId: 'wh-pune', destinationLocationId: 'str-mumbai-andheri', distanceKm: 165, baseCost: 350, costPerUnit: 8.0, estimatedHours: 5, carrierName: 'Expressway Cargo Logistics', reliabilityRate: 0.97 },
  { id: 'rt-pune-thane', sourceWarehouseId: 'wh-pune', destinationLocationId: 'str-thane', distanceKm: 155, baseCost: 320, costPerUnit: 7.5, estimatedHours: 5, carrierName: 'Expressway Cargo Logistics', reliabilityRate: 0.97 },
  { id: 'rt-pune-nashik', sourceWarehouseId: 'wh-pune', destinationLocationId: 'str-nashik', distanceKm: 210, baseCost: 450, costPerUnit: 10.0, estimatedHours: 6, carrierName: 'Maharashtra State Logistics', reliabilityRate: 0.96 },
  { id: 'rt-pune-nagpur', sourceWarehouseId: 'wh-pune', destinationLocationId: 'str-nagpur-dharampeth', distanceKm: 710, baseCost: 1100, costPerUnit: 22.0, estimatedHours: 16, carrierName: 'VRL Surface Transport', reliabilityRate: 0.94 },

  // From Mumbai Distribution Centre
  { id: 'rt-mumbai-andheri', sourceWarehouseId: 'wh-mumbai', destinationLocationId: 'str-mumbai-andheri', distanceKm: 28, baseCost: 100, costPerUnit: 3.0, estimatedHours: 2, carrierName: 'Mumbai Local Logistics', reliabilityRate: 0.98 },
  { id: 'rt-mumbai-thane', sourceWarehouseId: 'wh-mumbai', destinationLocationId: 'str-thane', distanceKm: 22, baseCost: 90, costPerUnit: 2.8, estimatedHours: 2, carrierName: 'Mumbai Local Logistics', reliabilityRate: 0.98 },
  { id: 'rt-mumbai-shivaji', sourceWarehouseId: 'wh-mumbai', destinationLocationId: 'str-pune-shivaji', distanceKm: 165, baseCost: 350, costPerUnit: 8.0, estimatedHours: 5, carrierName: 'Expressway Cargo Logistics', reliabilityRate: 0.97 },
  { id: 'rt-mumbai-kothrud', sourceWarehouseId: 'wh-mumbai', destinationLocationId: 'str-pune-kothrud', distanceKm: 170, baseCost: 360, costPerUnit: 8.2, estimatedHours: 5, carrierName: 'Expressway Cargo Logistics', reliabilityRate: 0.97 },
  { id: 'rt-mumbai-nashik', sourceWarehouseId: 'wh-mumbai', destinationLocationId: 'str-nashik', distanceKm: 160, baseCost: 340, costPerUnit: 7.8, estimatedHours: 5, carrierName: 'Western Transport Carrier', reliabilityRate: 0.96 },
  { id: 'rt-mumbai-nagpur', sourceWarehouseId: 'wh-mumbai', destinationLocationId: 'str-nagpur-dharampeth', distanceKm: 810, baseCost: 1250, costPerUnit: 25.0, estimatedHours: 18, carrierName: 'VRL Surface Transport', reliabilityRate: 0.93 },

  // From Nagpur Storage Hub
  { id: 'rt-nagpur-dharampeth', sourceWarehouseId: 'wh-nagpur', destinationLocationId: 'str-nagpur-dharampeth', distanceKm: 12, baseCost: 80, costPerUnit: 2.5, estimatedHours: 1, carrierName: 'Vidarbha Quick Logistics', reliabilityRate: 0.99 },
  { id: 'rt-nagpur-nashik', sourceWarehouseId: 'wh-nagpur', destinationLocationId: 'str-nashik', distanceKm: 670, baseCost: 1050, costPerUnit: 21.0, estimatedHours: 15, carrierName: 'VRL Surface Transport', reliabilityRate: 0.94 },
  { id: 'rt-nagpur-shivaji', sourceWarehouseId: 'wh-nagpur', destinationLocationId: 'str-pune-shivaji', distanceKm: 710, baseCost: 1100, costPerUnit: 22.0, estimatedHours: 16, carrierName: 'VRL Surface Transport', reliabilityRate: 0.93 },
  { id: 'rt-nagpur-kothrud', sourceWarehouseId: 'wh-nagpur', destinationLocationId: 'str-pune-kothrud', distanceKm: 715, baseCost: 1100, costPerUnit: 22.0, estimatedHours: 16, carrierName: 'VRL Surface Transport', reliabilityRate: 0.93 },
  { id: 'rt-nagpur-andheri', sourceWarehouseId: 'wh-nagpur', destinationLocationId: 'str-mumbai-andheri', distanceKm: 810, baseCost: 1250, costPerUnit: 25.0, estimatedHours: 18, carrierName: 'VRL Surface Transport', reliabilityRate: 0.93 },
  { id: 'rt-nagpur-thane', sourceWarehouseId: 'wh-nagpur', destinationLocationId: 'str-thane', distanceKm: 790, baseCost: 1200, costPerUnit: 24.0, estimatedHours: 17, carrierName: 'VRL Surface Transport', reliabilityRate: 0.93 },
];

// Baseline inventory items: realistically calibrated
export function createInitialInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];

  // Seed Warehouses
  MOCK_WAREHOUSES.forEach((wh) => {
    MOCK_PRODUCTS.forEach((prd) => {
      let q = 250;
      let reserved = 15;

      // Realistic excess situations in warehouses:
      if (wh.id === 'wh-pune' && prd.id === 'prd-port-chr') {
        q = 650; // Huge excess of Portronics Chargers in Pune!
      }
      if (wh.id === 'wh-mumbai' && prd.id === 'prd-boat-air') {
        q = 580; // Excess of boAt Airdopes in Mumbai DC!
      }
      if (wh.id === 'wh-nagpur' && prd.id === 'prd-amb-pwb') {
        q = 450; // Excess of Power Banks in Nagpur!
      }
      if (wh.id === 'wh-nagpur' && prd.id === 'prd-tpl-rtr') {
        q = 20; // Tight router stock in Nagpur (cannot fulfill massive orders)
      }

      items.push({
        id: `inv-${wh.id}-${prd.id}`,
        productId: prd.id,
        locationId: wh.id,
        locationType: 'warehouse',
        quantityOnHand: q,
        quantityReserved: reserved,
        reorderPoint: prd.minSafetyStock * 3,
        safetyStock: prd.minSafetyStock * 2,
        targetStockLevel: prd.maxStock * 3,
        lastRestockedAt: '2026-10-22T09:30:00Z',
      });
    });
  });

  // Seed Stores
  MOCK_STORES.forEach((str) => {
    MOCK_PRODUCTS.forEach((prd) => {
      let q = 45; // standard healthy stock
      let reserved = 2;

      // 1. Critical Shortage Case: Kothrud Store running out of Portronics Chargers!
      if (str.id === 'str-pune-kothrud' && prd.id === 'prd-port-chr') {
        q = 3; // Only 3 left, daily sales = 6 units/day -> 0.5 days remaining! (CRITICAL)
        reserved = 0;
      }

      // 2. Critical Shortage Case: Andheri Store running out of boAt Airdopes!
      if (str.id === 'str-mumbai-andheri' && prd.id === 'prd-boat-air') {
        q = 4; // Only 4 left, daily sales = 8 units/day -> 0.5 days remaining! (CRITICAL)
        reserved = 0;
      }

      // 3. Low Stock Case: Nashik Store low on Zebronics Keyboards!
      if (str.id === 'str-nashik' && prd.id === 'prd-zeb-kbd') {
        q = 10; // Safety stock is 18, sales = 3/day -> 3.3 days remaining! (LOW STOCK)
        reserved = 1;
      }

      // 4. Low Stock Case: Shivaji Nagar Store low on Wi-Fi Routers!
      if (str.id === 'str-pune-shivaji' && prd.id === 'prd-tpl-rtr') {
        q = 5; // Safety stock is 12, sales = 2.5/day -> 2.0 days remaining! (HIGH RISK)
        reserved = 1;
      }

      // 5. Store Extra Stock Case: Shivaji Nagar has surplus Wireless Mice!
      if (str.id === 'str-pune-shivaji' && prd.id === 'prd-logi-mse') {
        q = 110; // Target is 40 -> 70 units extra stock!
      }

      items.push({
        id: `inv-${str.id}-${prd.id}`,
        productId: prd.id,
        locationId: str.id,
        locationType: 'store',
        quantityOnHand: q,
        quantityReserved: reserved,
        reorderPoint: prd.minSafetyStock,
        safetyStock: prd.minSafetyStock,
        targetStockLevel: prd.minSafetyStock * 2.5,
        lastRestockedAt: '2026-10-23T11:00:00Z',
      });
    });
  });

  return items;
}

// Generate realistic sales history and average daily sales rates for store/product pairs
export function createInitialDemandRecords(): Record<string, { avgDaily: number; history: number[]; peak: number }> {
  const records: Record<string, { avgDaily: number; history: number[]; peak: number }> = {};

  MOCK_STORES.forEach((str) => {
    MOCK_PRODUCTS.forEach((prd) => {
      const key = `${str.id}_${prd.id}`;
      let baseAvg = 4.5;

      // Adjust for flagship stores
      if (str.priorityTier === 'flagship') baseAvg = 7.0;
      if (str.priorityTier === 'express') baseAvg = 5.0;

      // Specific critical demand pairs
      if (prd.id === 'prd-port-chr' && str.id === 'str-pune-kothrud') baseAvg = 6.0;
      if (prd.id === 'prd-boat-air' && str.id === 'str-mumbai-andheri') baseAvg = 8.0;
      if (prd.id === 'prd-zeb-kbd' && str.id === 'str-nashik') baseAvg = 3.0;
      if (prd.id === 'prd-tpl-rtr' && str.id === 'str-pune-shivaji') baseAvg = 2.5;
      if (prd.id === 'prd-logi-mse' && str.id === 'str-pune-shivaji') baseAvg = 3.5; // low sales vs 110 stock

      const roundedAvg = Math.round(baseAvg * 10) / 10;
      const history: number[] = [];
      for (let day = 1; day <= 14; day++) {
        const variation = (Math.sin(day * 1.4) * 0.2 + (Math.random() * 0.2 - 0.1)) * roundedAvg;
        history.push(Math.max(1, Math.round(roundedAvg + variation)));
      }
      const peak = Math.max(...history);

      records[key] = {
        avgDaily: roundedAvg,
        history,
        peak,
      };
    });
  });

  return records;
}

export const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-101',
    movementNumber: 'MOV-2026-0101',
    timestamp: '2026-10-24T16:30:00Z',
    productId: 'prd-port-chr',
    sourceLocationId: 'wh-pune',
    destinationLocationId: 'str-pune-kothrud',
    type: 'transfer',
    quantity: 40,
    referenceDoc: 'TRF-PUN-042',
    initiatedBy: 'Soham Jadhav',
    status: 'in_transit',
    notes: 'Urgent stock shortage replenishment for Kothrud store.',
  },
  {
    id: 'mov-102',
    movementNumber: 'MOV-2026-0102',
    timestamp: '2026-10-24T14:15:00Z',
    productId: 'prd-boat-air',
    sourceLocationId: 'wh-mumbai',
    destinationLocationId: 'str-mumbai-andheri',
    type: 'transfer',
    quantity: 50,
    referenceDoc: 'TRF-MUM-018',
    initiatedBy: 'Soham Jadhav',
    status: 'completed',
    notes: 'Restored Andheri flagship inventory to safe 14-day stock level.',
  },
  {
    id: 'mov-103',
    movementNumber: 'MOV-2026-0103',
    timestamp: '2026-10-23T11:00:00Z',
    productId: 'prd-amb-pwb',
    sourceLocationId: undefined,
    destinationLocationId: 'wh-pune',
    type: 'inbound',
    quantity: 200,
    referenceDoc: 'PO-AMB-2026-88',
    initiatedBy: 'System Receipt',
    status: 'completed',
    notes: 'Factory inbound delivery verified.',
  },
  {
    id: 'mov-104',
    movementNumber: 'MOV-2026-0104',
    timestamp: '2026-10-22T17:45:00Z',
    productId: 'prd-zeb-kbd',
    sourceLocationId: 'wh-pune',
    destinationLocationId: undefined,
    type: 'adjustment',
    quantity: -2,
    referenceDoc: 'ADJ-CYCLE-09',
    initiatedBy: 'Suresh Patil',
    status: 'completed',
    notes: 'Physical count adjustment (box damaged during unloading).',
  },
];

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'shp-201',
    shipmentCode: 'DEL-PUN-0201',
    originId: 'wh-pune',
    destinationId: 'str-pune-kothrud',
    carrier: 'Pune City Express Delivery',
    trackingNumber: 'PUN-EXP-88912',
    status: 'in_transit',
    departureDate: '2026-10-25T06:30:00Z',
    estimatedArrival: '2026-10-25T11:30:00Z',
    items: [{ productId: 'prd-port-chr', quantity: 40 }],
    totalCost: 180, // ₹180 delivery fee
    statusHistory: [
      { timestamp: '2026-10-25T06:30:00Z', status: 'pending', location: 'Pune Central Warehouse, Bhosari', notes: 'Packed and sealed in delivery van.' },
      { timestamp: '2026-10-25T07:45:00Z', status: 'in_transit', location: 'University Circle, Pune', notes: 'On the way to Kothrud Digital Store.' },
    ],
  },
  {
    id: 'shp-202',
    shipmentCode: 'DEL-MUM-0202',
    originId: 'wh-mumbai',
    destinationId: 'str-mumbai-andheri',
    carrier: 'Mumbai Local Logistics',
    trackingNumber: 'MUM-LOC-44120',
    status: 'delivered',
    departureDate: '2026-10-24T09:00:00Z',
    estimatedArrival: '2026-10-24T12:00:00Z',
    actualArrival: '2026-10-24T11:45:00Z',
    items: [{ productId: 'prd-boat-air', quantity: 50 }],
    totalCost: 275, // ₹275 delivery fee
    statusHistory: [
      { timestamp: '2026-10-24T09:00:00Z', status: 'in_transit', location: 'Bhiwandi Hub, Mumbai', notes: 'Dispatched via Western Express Highway.' },
      { timestamp: '2026-10-24T11:45:00Z', status: 'delivered', location: 'Andheri West Store', notes: 'Delivered and confirmed by Vikas Mehta.' },
    ],
  },
  {
    id: 'shp-203',
    shipmentCode: 'DEL-NSK-0203',
    originId: 'wh-mumbai',
    destinationId: 'str-nashik',
    carrier: 'Western Transport Carrier',
    trackingNumber: 'WTC-NSK-10928',
    status: 'pending',
    departureDate: '2026-10-25T14:00:00Z',
    estimatedArrival: '2026-10-26T10:00:00Z',
    items: [{ productId: 'prd-zeb-kbd', quantity: 30 }],
    totalCost: 574, // ₹574 delivery fee
    statusHistory: [
      { timestamp: '2026-10-25T07:00:00Z', status: 'pending', location: 'Bhiwandi Distribution Centre', notes: 'Waiting for carrier pickup.' },
    ],
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'Urgent Shortage at Kothrud Digital Store (Pune)',
    message: 'Portronics USB-C Charger down to 3 units with 6 units/day sales (0.5 days remaining).',
    severity: 'critical',
    category: 'stockout',
    timestamp: '15 mins ago',
    read: false,
    linkPage: 'stockout-alerts',
    actionLabel: 'View Alert',
  },
  {
    id: 'notif-02',
    title: 'Urgent Shortage at Andheri Electronics (Mumbai)',
    message: 'boAt Airdopes Earbuds down to 4 units with 8 units/day sales (0.5 days remaining).',
    severity: 'critical',
    category: 'stockout',
    timestamp: '40 mins ago',
    read: false,
    linkPage: 'stockout-alerts',
    actionLabel: 'Send Stock',
  },
  {
    id: 'notif-03',
    title: 'Extra Stock: 650 Portronics Chargers in Pune Warehouse',
    message: 'Pune Central Warehouse has surplus stock exceeding 21-day safety requirements.',
    severity: 'warning',
    category: 'optimization',
    timestamp: '2 hours ago',
    read: false,
    linkPage: 'excess-inventory',
    actionLabel: 'Review Extra Stock',
  },
  {
    id: 'notif-04',
    title: 'Delivery DEL-PUN-0201 On The Way to Kothrud',
    message: 'Pune City Express vehicle dispatched with 40 units of Portronics Chargers.',
    severity: 'info',
    category: 'shipment',
    timestamp: '3 hours ago',
    read: true,
    linkPage: 'shipments',
    actionLabel: 'Track Delivery',
  },
];

export const MOCK_SAVED_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scn-diwali-surge',
    name: 'Diwali Festive Demand Spike (+40%)',
    description: 'Tests network capacity when consumer electronics sales surge by 40% during the festival week.',
    createdAt: '2026-10-23T10:00:00Z',
    demandMultiplier: 1.4,
    transportCostMultiplier: 1.1,
    budgetLimit: 30000,
    objective: 'prevent_stockout',
    baselineMetrics: {
      stockoutsPrevented: 4,
      totalCost: 1850,
      serviceLevel: 98.2,
      unfulfilledUnits: 0,
    },
    simulatedMetrics: {
      stockoutsPrevented: 8,
      totalCost: 3420,
      serviceLevel: 95.8,
      unfulfilledUnits: 15,
    },
  },
  {
    id: 'scn-fuel-hike',
    name: 'State Highway Fuel Rate Hike (+25%)',
    description: 'Models delivery cost changes under a 25% diesel and carrier transport surcharge.',
    createdAt: '2026-10-21T14:30:00Z',
    demandMultiplier: 1.0,
    transportCostMultiplier: 1.25,
    budgetLimit: 25000,
    objective: 'minimize_cost',
    baselineMetrics: {
      stockoutsPrevented: 4,
      totalCost: 1850,
      serviceLevel: 98.2,
      unfulfilledUnits: 0,
    },
    simulatedMetrics: {
      stockoutsPrevented: 4,
      totalCost: 2310,
      serviceLevel: 98.0,
      unfulfilledUnits: 0,
    },
  },
  {
    id: 'scn-pune-maintenance',
    name: 'Pune Warehouse Maintenance Outage',
    description: 'Simulates Pune Warehouse temporarily offline, routing all Maharashtra store demand through Mumbai DC.',
    createdAt: '2026-10-19T16:00:00Z',
    demandMultiplier: 1.0,
    transportCostMultiplier: 1.15,
    budgetLimit: 35000,
    disruptedWarehouseId: 'wh-pune',
    objective: 'prevent_stockout',
    baselineMetrics: {
      stockoutsPrevented: 4,
      totalCost: 1850,
      serviceLevel: 98.2,
      unfulfilledUnits: 0,
    },
    simulatedMetrics: {
      stockoutsPrevented: 3,
      totalCost: 4120,
      serviceLevel: 91.5,
      unfulfilledUnits: 45,
    },
  },
];
