import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
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
  StockWisePage,
  OptimizationSettings,
  OptimizationResult,
  StockoutRiskLevel,
  ShipmentStatus,
} from '../types/stockwise';
import {
  MOCK_WAREHOUSES,
  MOCK_STORES,
  MOCK_PRODUCTS,
  MOCK_ROUTE_COSTS,
  MOCK_MOVEMENTS,
  MOCK_SHIPMENTS,
  MOCK_NOTIFICATIONS,
  MOCK_SAVED_SCENARIOS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_USER_PROFILE,
  createInitialInventory,
  createInitialDemandRecords,
} from '../data/mockStockWiseData';
import {
  calculateDaysRemaining,
  classifyStockoutRisk,
  computeExcessInventory,
  ExcessInventoryItem,
  runDistributionOptimization,
} from '../lib/inventoryEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StockoutAlertItem {
  id: string;
  store: Store;
  product: Product;
  availableStock: number;
  safetyStock: number;
  avgDailyDemand: number;
  daysRemaining: number | null;
  riskLevel: StockoutRiskLevel;
  suggestedReplenishment: number;
}

interface StockWiseContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;

  // Navigation
  currentPage: StockWisePage;
  setCurrentPage: (page: StockWisePage) => void;
  breadcrumbs: { label: string; page?: StockWisePage }[];

  // Entities
  products: Product[];
  warehouses: Warehouse[];
  stores: Store[];
  inventory: InventoryItem[];
  movements: StockMovement[];
  shipments: Shipment[];
  notifications: NotificationItem[];
  savedScenarios: SimulationScenario[];
  companySettings: CompanySettings;
  userProfile: UserProfile;
  routeCosts: RouteCost[];
  demandRecords: Record<string, { avgDaily: number; history: number[]; peak: number }>;

  // Computed Intelligence
  stockoutAlerts: StockoutAlertItem[];
  criticalStockoutsCount: number;
  excessInventoryItems: ExcessInventoryItem[];
  totalInventoryValue: number;
  unreadNotificationsCount: number;
  activeShipmentsCount: number;

  // Optimization
  currentOptimizationResult: OptimizationResult | null;
  isOptimizing: boolean;
  isPlanStale: boolean;
  setIsPlanStale: (stale: boolean) => void;
  runOptimization: (customSettings?: Partial<OptimizationSettings>) => Promise<OptimizationResult>;
  approveRecommendation: (recId: string) => void;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => Warehouse;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  addStore: (store: Omit<Store, 'id'>) => Store;
  updateStore: (id: string, updates: Partial<Store>) => void;
  adjustInventoryStock: (locationId: string, productId: string, deltaQty: number, notes?: string) => void;
  importCSVProducts: (importedList: Partial<Product>[]) => { successCount: number; errorCount: number; errors: string[] };
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus, location: string, notes: string) => void;
  saveScenario: (scenario: SimulationScenario) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  resetToRealisticDemoData: () => void;

  // AI Copilot state
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
}

const StockWiseContext = createContext<StockWiseContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vyaparmitra_platform_data_v1';
const AUTH_STORAGE_KEY = 'vyaparmitra_auth';

export const StockWiseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  // Navigation State
  const [currentPage, setCurrentPage] = useState<StockWisePage>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true' ? 'dashboard' : 'login';
  });
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isPlanStale, setIsPlanStale] = useState(false);

  // Load from LocalStorage if present, else initialize mock
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_warehouses`);
    return saved ? JSON.parse(saved) : MOCK_WAREHOUSES;
  });

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_stores`);
    return saved ? JSON.parse(saved) : MOCK_STORES;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : createInitialInventory();
  });

  const [demandRecords] = useState<Record<string, { avgDaily: number; history: number[]; peak: number }>>(() => {
    return createInitialDemandRecords();
  });

  const [routeCosts] = useState<RouteCost[]>(MOCK_ROUTE_COSTS);

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_movements`);
    return saved ? JSON.parse(saved) : MOCK_MOVEMENTS;
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_shipments`);
    return saved ? JSON.parse(saved) : MOCK_SHIPMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  const [savedScenarios, setSavedScenarios] = useState<SimulationScenario[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_scenarios`);
    return saved ? JSON.parse(saved) : MOCK_SAVED_SCENARIOS;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });

  const [userProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);

  // Optimization Result Cache
  const [currentOptimizationResult, setCurrentOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Authentication methods
  const login = (emailInput: string, passInput: string): { success: boolean; error?: string } => {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPass = passInput || '';

    if (cleanEmail === 'admin@gmail.com' && cleanPass === 'Admin@123') {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setCurrentPage('dashboard');
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your administrator email and password.',
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentPage('login');
  };

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_warehouses`, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_stores`, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_inventory`, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_movements`, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_shipments`, JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_scenarios`, JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_settings`, JSON.stringify(companySettings));
  }, [companySettings]);

  // Live Supabase Database Sync (Full-Stack PostgreSQL sync)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const fetchSupabaseData = async () => {
      try {
        const { data: dbProducts, error: prodErr } = await client.from('products').select('*');
        if (!prodErr && dbProducts && dbProducts.length > 0) {
          const mappedProducts: Product[] = dbProducts.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: p.category,
            unitCost: Number(p.unit_cost),
            sellingPrice: Number(p.selling_price),
            weightKg: Number(p.weight_kg || 0.5),
            minSafetyStock: Number(p.min_safety_stock || 20),
            maxStock: Number(p.max_stock || 200),
            leadTimeDays: Number(p.lead_time_days || 2),
            isPerishable: Boolean(p.is_perishable),
            expiryDate: p.expiry_date,
            description: p.description || '',
            unitOfMeasure: p.unit_of_measure || 'Units',
          }));
          setProducts(mappedProducts);
        }

        const { data: dbWarehouses, error: whErr } = await client.from('warehouses').select('*');
        if (!whErr && dbWarehouses && dbWarehouses.length > 0) {
          const mappedWarehouses: Warehouse[] = dbWarehouses.map((w: any) => ({
            id: w.id,
            code: w.code,
            name: w.name,
            type: 'warehouse',
            address: w.address,
            city: w.city,
            state: w.state,
            lat: Number(w.lat),
            lng: Number(w.lng),
            totalCapacityUnits: Number(w.total_capacity_units),
            usedCapacityUnits: Number(w.used_capacity_units),
            operatingCostPerDay: Number(w.operating_cost_per_day),
            managerName: w.manager_name,
            contactPhone: w.contact_phone,
            status: w.status,
          }));
          setWarehouses(mappedWarehouses);
        }

        const { data: dbStores, error: stErr } = await client.from('stores').select('*');
        if (!stErr && dbStores && dbStores.length > 0) {
          const mappedStores: Store[] = dbStores.map((s: any) => ({
            id: s.id,
            code: s.code,
            name: s.name,
            type: 'store',
            address: s.address,
            city: s.city,
            state: s.state,
            lat: Number(s.lat),
            lng: Number(s.lng),
            priorityTier: s.priority_tier,
            dailyFootfall: Number(s.daily_footfall),
            managerName: s.manager_name,
            contactPhone: s.contact_phone,
            status: s.status,
          }));
          setStores(mappedStores);
        }

        const { data: dbInventory, error: invErr } = await client.from('inventory_items').select('*');
        if (!invErr && dbInventory && dbInventory.length > 0) {
          const mappedInventory: InventoryItem[] = dbInventory.map((i: any) => ({
            id: i.id,
            productId: i.product_id,
            locationId: i.location_id,
            locationType: i.location_type,
            quantityOnHand: Number(i.quantity_on_hand),
            quantityReserved: Number(i.quantity_reserved),
            reorderPoint: Number(i.reorder_point),
            safetyStock: Number(i.safety_stock),
            targetStockLevel: Number(i.target_stock_level),
            lastRestockedAt: i.last_restocked_at,
            batchNumber: i.batch_number,
          }));
          setInventory(mappedInventory);
        }
      } catch (e) {
        console.warn('Supabase fetch error, using local fallback:', e);
      }
    };

    fetchSupabaseData();
  }, []);

  // Compute stockout alerts dynamically
  const stockoutAlerts: StockoutAlertItem[] = useMemo(() => {
    const alerts: StockoutAlertItem[] = [];

    stores.forEach((store) => {
      products.forEach((product) => {
        const inv = inventory.find((i) => i.locationId === store.id && i.productId === product.id);
        const onHand = inv ? inv.quantityOnHand : 0;
        const reserved = inv ? inv.quantityReserved : 0;
        const available = Math.max(0, onHand - reserved);
        const safety = inv ? inv.safetyStock : product.minSafetyStock;

        const demandKey = `${store.id}_${product.id}`;
        const avgDaily = demandRecords[demandKey]?.avgDaily || 0;
        const daysRemaining = calculateDaysRemaining(available, avgDaily);
        const riskLevel = classifyStockoutRisk(available, safety, daysRemaining);

        if (riskLevel === 'critical' || riskLevel === 'high' || riskLevel === 'moderate') {
          const targetDays = companySettings.defaultTargetDaysSupply || 21;
          const targetStock = avgDaily > 0 ? Math.max(safety * 1.5, Math.ceil(avgDaily * targetDays)) : safety * 2;
          const suggestedReplenishment = Math.max(0, targetStock - available);

          alerts.push({
            id: `alert-${store.id}-${product.id}`,
            store,
            product,
            availableStock: available,
            safetyStock: safety,
            avgDailyDemand: avgDaily,
            daysRemaining,
            riskLevel,
            suggestedReplenishment,
          });
        }
      });
    });

    const riskRank: Record<StockoutRiskLevel, number> = {
      critical: 3,
      high: 2,
      moderate: 1,
      low: 0,
      none: 0,
    };
    return alerts.sort((a, b) => riskRank[b.riskLevel] - riskRank[a.riskLevel]);
  }, [stores, products, inventory, demandRecords, companySettings.defaultTargetDaysSupply]);

  const criticalStockoutsCount = useMemo(() => {
    return stockoutAlerts.filter((a) => a.riskLevel === 'critical').length;
  }, [stockoutAlerts]);

  // Compute excess inventory dynamically
  const excessInventoryItems: ExcessInventoryItem[] = useMemo(() => {
    return computeExcessInventory(
      inventory,
      products,
      warehouses,
      stores,
      demandRecords,
      routeCosts,
      companySettings.holdingCostRateAnnual
    );
  }, [inventory, products, warehouses, stores, demandRecords, routeCosts, companySettings.holdingCostRateAnnual]);

  // Total inventory value on hand
  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product ? product.unitCost * item.quantityOnHand : 0);
    }, 0);
  }, [inventory, products]);

  // Unread notifications
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Active in-transit or pending shipments
  const activeShipmentsCount = useMemo(() => {
    return shipments.filter((s) => s.status === 'in_transit' || s.status === 'pending').length;
  }, [shipments]);

  // Run Distribution Optimization Engine
  const runOptimization = async (customSettings?: Partial<OptimizationSettings>): Promise<OptimizationResult> => {
    setIsOptimizing(true);

    const effectiveSettings: OptimizationSettings = {
      objective: customSettings?.objective || 'balanced',
      budgetLimit: customSettings?.budgetLimit !== undefined ? customSettings.budgetLimit : 50000,
      bufferStockMultiplier: customSettings?.bufferStockMultiplier || 1.2,
      maxTransferLeadTimeDays: customSettings?.maxTransferLeadTimeDays || 7,
      selectedWarehouseIds: customSettings?.selectedWarehouseIds || warehouses.map((w) => w.id),
      selectedStoreIds: customSettings?.selectedStoreIds || stores.map((s) => s.id),
      selectedProductCategories: customSettings?.selectedProductCategories || [],
    };

    // Realistic calculation feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = runDistributionOptimization({
      inventory,
      products,
      warehouses,
      stores,
      demandRecords,
      routeCosts,
      settings: effectiveSettings,
    });

    setCurrentOptimizationResult(result);
    setIsPlanStale(false);
    setIsOptimizing(false);
    return result;
  };

  // Run optimization once on initial mount if empty
  useEffect(() => {
    if (!currentOptimizationResult) {
      const initial = runDistributionOptimization({
        inventory,
        products,
        warehouses,
        stores,
        demandRecords,
        routeCosts,
        settings: {
          objective: 'balanced',
          budgetLimit: 50000,
          bufferStockMultiplier: 1.2,
          maxTransferLeadTimeDays: 7,
          selectedWarehouseIds: warehouses.map((w) => w.id),
          selectedStoreIds: stores.map((s) => s.id),
          selectedProductCategories: [],
        },
      });
      setCurrentOptimizationResult(initial);
    }
  }, []);

  // Approve a recommendation -> Dispatches transfer, reserves/deducts warehouse stock, creates 'On the way' shipment
  const approveRecommendation = (recId: string) => {
    if (!currentOptimizationResult) return;

    const rec = currentOptimizationResult.recommendations.find((r) => r.id === recId);
    if (!rec || rec.status === 'approved' || rec.status === 'dispatched') return;

    const sourceWh = warehouses.find((w) => w.id === rec.sourceLocationId);
    const destStr = stores.find((s) => s.id === rec.destinationLocationId);
    const prd = products.find((p) => p.id === rec.productId);

    // 1. Deduct recommended quantity from source warehouse on-hand
    setInventory((prev) =>
      prev.map((item) => {
        if (item.locationId === rec.sourceLocationId && item.productId === rec.productId) {
          return {
            ...item,
            quantityOnHand: Math.max(0, item.quantityOnHand - rec.recommendedQuantity),
          };
        }
        return item;
      })
    );

    // 2. Create an 'On the way' shipment
    const newShipmentId = `shp-${Date.now()}`;
    const trackingCode = `MAH-EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newShipment: Shipment = {
      id: newShipmentId,
      shipmentCode: `SHP-${Date.now().toString().slice(-5)}`,
      originId: rec.sourceLocationId,
      destinationId: rec.destinationLocationId,
      carrier: 'Maharashtra Express Logistics',
      trackingNumber: trackingCode,
      status: 'in_transit',
      departureDate: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + rec.transitDays * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          productId: rec.productId,
          quantity: rec.recommendedQuantity,
        },
      ],
      totalCost: rec.estimatedCost,
      statusHistory: [
        {
          timestamp: new Date().toISOString(),
          status: 'in_transit',
          location: sourceWh ? `${sourceWh.city} Hub` : 'Warehouse',
          notes: `Dispatched from ${sourceWh?.name}. On the way to ${destStr?.name}.`,
        },
      ],
    };
    setShipments((prev) => [newShipment, ...prev]);

    // 3. Create a stock movement log for dispatch
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      movementNumber: `MOV-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      productId: rec.productId,
      sourceLocationId: rec.sourceLocationId,
      destinationLocationId: rec.destinationLocationId,
      type: 'transfer',
      quantity: rec.recommendedQuantity,
      referenceDoc: newShipment.shipmentCode,
      initiatedBy: userProfile.name,
      status: 'in_transit',
      notes: `Transfer dispatched: ${rec.recommendedQuantity} units sent to ${destStr?.name}.`,
    };
    setMovements((prev) => [newMovement, ...prev]);

    // 4. Update recommendation status
    setCurrentOptimizationResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        recommendations: prev.recommendations.map((r) =>
          r.id === recId ? { ...r, status: 'dispatched' as const } : r
        ),
      };
    });

    // 5. Notify user
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Stock Sent: ${rec.recommendedQuantity} units On the Way`,
        message: `${prd?.name || 'Product'} dispatched from ${sourceWh?.name} to ${destStr?.name}. Tracking: ${trackingCode}`,
        severity: 'info',
        category: 'shipment',
        timestamp: 'Just now',
        read: false,
        linkPage: 'shipments',
        actionLabel: 'Track Delivery',
      },
      ...prev,
    ]);
  };

  // Add Product
  const addProduct = (newPrd: Omit<Product, 'id'>): Product => {
    const id = `prd-${Date.now()}`;
    const product: Product = { ...newPrd, id };
    setProducts((prev) => [product, ...prev]);

    // Initialize inventory records for each location
    const newInvItems: InventoryItem[] = [];
    warehouses.forEach((w) => {
      newInvItems.push({
        id: `inv-${w.id}-${id}`,
        productId: id,
        locationId: w.id,
        locationType: 'warehouse',
        quantityOnHand: product.minSafetyStock * 8,
        quantityReserved: 0,
        reorderPoint: product.minSafetyStock * 3,
        safetyStock: product.minSafetyStock * 2,
        targetStockLevel: product.maxStock * 5,
        lastRestockedAt: new Date().toISOString(),
      });
    });
    stores.forEach((s) => {
      newInvItems.push({
        id: `inv-${s.id}-${id}`,
        productId: id,
        locationId: s.id,
        locationType: 'store',
        quantityOnHand: product.minSafetyStock * 2,
        quantityReserved: 0,
        reorderPoint: product.minSafetyStock,
        safetyStock: product.minSafetyStock,
        targetStockLevel: product.minSafetyStock * 3,
        lastRestockedAt: new Date().toISOString(),
      });
    });
    setInventory((prev) => [...prev, ...newInvItems]);
    setIsPlanStale(true);

    return product;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    setIsPlanStale(true);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setInventory((prev) => prev.filter((i) => i.productId !== id));
    setIsPlanStale(true);
  };

  // Locations CRUD
  const addWarehouse = (wh: Omit<Warehouse, 'id'>): Warehouse => {
    const id = `wh-${Date.now()}`;
    const warehouse: Warehouse = { ...wh, id };
    setWarehouses((prev) => [...prev, warehouse]);
    setIsPlanStale(true);
    return warehouse;
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    setIsPlanStale(true);
  };

  const addStore = (str: Omit<Store, 'id'>): Store => {
    const id = `str-${Date.now()}`;
    const store: Store = { ...str, id };
    setStores((prev) => [...prev, store]);
    setIsPlanStale(true);
    return store;
  };

  const updateStore = (id: string, updates: Partial<Store>) => {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    setIsPlanStale(true);
  };

  // Adjust stock
  const adjustInventoryStock = (locationId: string, productId: string, deltaQty: number, notes?: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.locationId === locationId && item.productId === productId) {
          const newQty = Math.max(0, item.quantityOnHand + deltaQty);
          return { ...item, quantityOnHand: newQty };
        }
        return item;
      })
    );
    setIsPlanStale(true);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      movementNumber: `MOV-ADJ-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      productId,
      sourceLocationId: deltaQty < 0 ? locationId : undefined,
      destinationLocationId: deltaQty > 0 ? locationId : undefined,
      type: 'adjustment',
      quantity: deltaQty,
      referenceDoc: `MANUAL-ADJ`,
      initiatedBy: userProfile.name,
      status: 'completed',
      notes: notes || 'Manual inventory correction.',
    };
    setMovements((prev) => [movement, ...prev]);
  };

  // CSV Import
  const importCSVProducts = (importedList: Partial<Product>[]) => {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    importedList.forEach((raw, idx) => {
      if (!raw.name || !raw.sku) {
        errorCount++;
        errors.push(`Row #${idx + 1}: Missing product name or SKU.`);
        return;
      }
      const existing = products.find((p) => p.sku.toLowerCase() === raw.sku?.toLowerCase());
      if (existing) {
        errorCount++;
        errors.push(`Row #${idx + 1}: SKU ${raw.sku} already exists.`);
        return;
      }

      addProduct({
        sku: raw.sku,
        name: raw.name,
        category: (raw.category as any) || 'Consumer Goods',
        unitCost: Number(raw.unitCost) || 500,
        sellingPrice: Number(raw.sellingPrice) || 999,
        weightKg: Number(raw.weightKg) || 0.5,
        minSafetyStock: Number(raw.minSafetyStock) || 30,
        maxStock: Number(raw.maxStock) || 200,
        leadTimeDays: Number(raw.leadTimeDays) || 3,
        isPerishable: Boolean(raw.isPerishable),
        expiryDate: raw.expiryDate,
        description: raw.description || `Imported product SKU ${raw.sku}`,
        unitOfMeasure: raw.unitOfMeasure || 'Units',
      });
      successCount++;
    });

    setIsPlanStale(true);
    return { successCount, errorCount, errors };
  };

  // Shipment Lifecycle: When marked delivered, increment destination store stock!
  const updateShipmentStatus = (
    shipmentId: string,
    newStatus: ShipmentStatus,
    location: string,
    notes: string
  ) => {
    const existingShipment = shipments.find((s) => s.id === shipmentId);
    if (!existingShipment) return;

    const wasNotDelivered = existingShipment.status !== 'delivered';

    // If changing to 'delivered' and wasn't delivered before:
    if (newStatus === 'delivered' && wasNotDelivered) {
      // Add items to destination store inventory
      setInventory((prev) =>
        prev.map((item) => {
          if (item.locationId === existingShipment.destinationId) {
            const shippedItem = existingShipment.items.find((i) => i.productId === item.productId);
            if (shippedItem) {
              return {
                ...item,
                quantityOnHand: item.quantityOnHand + shippedItem.quantity,
                lastRestockedAt: new Date().toISOString(),
              };
            }
          }
          return item;
        })
      );

      // Create a completed delivery stock movement
      existingShipment.items.forEach((item) => {
        const destStore = stores.find((s) => s.id === existingShipment.destinationId);
        const mov: StockMovement = {
          id: `mov-${Date.now()}-${item.productId}`,
          movementNumber: `MOV-DEL-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString(),
          productId: item.productId,
          sourceLocationId: existingShipment.originId,
          destinationLocationId: existingShipment.destinationId,
          type: 'inbound',
          quantity: item.quantity,
          referenceDoc: existingShipment.shipmentCode,
          initiatedBy: userProfile.name,
          status: 'completed',
          notes: `Stock delivered and received at ${destStore?.name || 'Retail Store'}.`,
        };
        setMovements((prev) => [mov, ...prev]);
      });

      // Notify
      const destStore = stores.find((s) => s.id === existingShipment.destinationId);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Delivery Completed: ${existingShipment.shipmentCode}`,
          message: `Stock successfully delivered to ${destStore?.name || 'Retail Store'}. Store inventory updated.`,
          severity: 'info',
          category: 'shipment',
          timestamp: 'Just now',
          read: false,
          linkPage: 'shipments',
          actionLabel: 'View Shipments',
        },
        ...prev,
      ]);
    }

    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          const newEvent = {
            timestamp: new Date().toISOString(),
            status: newStatus,
            location: location || 'Transit Point',
            notes: notes || `Status updated to ${newStatus}`,
          };
          return {
            ...s,
            status: newStatus,
            statusHistory: [...s.statusHistory, newEvent],
            actualArrival: newStatus === 'delivered' ? new Date().toISOString() : s.actualArrival,
          };
        }
        return s;
      })
    );
  };

  // Save Scenario
  const saveScenario = (scenario: SimulationScenario) => {
    setSavedScenarios((prev) => [scenario, ...prev.filter((s) => s.id !== scenario.id)]);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateCompanySettings = (updates: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...updates }));
  };

  // Reset Data to Clean Indian Baseline
  const resetToRealisticDemoData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_products`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_warehouses`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_stores`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_inventory`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_movements`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_shipments`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_notifications`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_scenarios`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_settings`);

    setProducts(MOCK_PRODUCTS);
    setWarehouses(MOCK_WAREHOUSES);
    setStores(MOCK_STORES);
    setInventory(createInitialInventory());
    setMovements(MOCK_MOVEMENTS);
    setShipments(MOCK_SHIPMENTS);
    setNotifications(MOCK_NOTIFICATIONS);
    setSavedScenarios(MOCK_SAVED_SCENARIOS);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);

    const initial = runDistributionOptimization({
      inventory: createInitialInventory(),
      products: MOCK_PRODUCTS,
      warehouses: MOCK_WAREHOUSES,
      stores: MOCK_STORES,
      demandRecords,
      routeCosts,
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
    setCurrentOptimizationResult(initial);
    setIsPlanStale(false);
  };

  // Dynamic Breadcrumb Computation with Simplified Indian Business terminology
  const breadcrumbs = useMemo(() => {
    const list: { label: string; page?: StockWisePage }[] = [{ label: 'VyaparMitra', page: 'dashboard' }];

    const pageLabels: Record<StockWisePage, { section: string; label: string }> = {
      dashboard: { section: 'OVERVIEW', label: 'Dashboard' },
      products: { section: 'INVENTORY', label: 'Products' },
      'stock-movements': { section: 'INVENTORY', label: 'Stock Movements' },
      'import-data': { section: 'INVENTORY', label: 'Import Data' },
      warehouses: { section: 'LOCATIONS', label: 'Warehouses' },
      stores: { section: 'LOCATIONS', label: 'Stores & Distributors' },
      'demand-analysis': { section: 'INTELLIGENCE', label: 'Demand Analysis' },
      'stockout-alerts': { section: 'INTELLIGENCE', label: 'Stockout Alerts' },
      'excess-inventory': { section: 'INTELLIGENCE', label: 'Excess Inventory' },
      'redistribution-recommendations': { section: 'INTELLIGENCE', label: 'Redistribution Recommendations' },
      'distribution-planner': { section: 'DISTRIBUTION', label: 'Distribution Planner' },
      'optimization-results': { section: 'DISTRIBUTION', label: 'Optimization Results' },
      'plan-comparison': { section: 'DISTRIBUTION', label: 'Plan Comparison' },
      shipments: { section: 'DISTRIBUTION', label: 'Shipments' },
      simulation: { section: 'OVERVIEW', label: 'Dashboard' },
      'saved-scenarios': { section: 'OVERVIEW', label: 'Dashboard' },
      reports: { section: 'REPORTS & SYSTEM', label: 'Reports & Summary' },
      notifications: { section: 'REPORTS & SYSTEM', label: 'Notifications' },
      settings: { section: 'REPORTS & SYSTEM', label: 'Settings' },
      'help-support': { section: 'HELP & SUPPORT', label: 'Help & Guide' },
      login: { section: 'AUTH', label: 'Admin Login' },
    };

    const current = pageLabels[currentPage];
    if (current) {
      list.push({ label: current.section });
      list.push({ label: current.label, page: currentPage });
    }

    return list;
  }, [currentPage]);

  return (
    <StockWiseContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        currentPage,
        setCurrentPage,
        breadcrumbs,
        products,
        warehouses,
        stores,
        inventory,
        movements,
        shipments,
        notifications,
        savedScenarios,
        companySettings,
        userProfile,
        routeCosts,
        demandRecords,
        stockoutAlerts,
        criticalStockoutsCount,
        excessInventoryItems,
        totalInventoryValue,
        unreadNotificationsCount,
        activeShipmentsCount,
        currentOptimizationResult,
        isOptimizing,
        isPlanStale,
        setIsPlanStale,
        runOptimization,
        approveRecommendation,
        addProduct,
        updateProduct,
        deleteProduct,
        addWarehouse,
        updateWarehouse,
        addStore,
        updateStore,
        adjustInventoryStock,
        importCSVProducts,
        updateShipmentStatus,
        saveScenario,
        markNotificationRead,
        markAllNotificationsRead,
        updateCompanySettings,
        resetToRealisticDemoData,
        isCopilotOpen,
        setIsCopilotOpen,
      }}
    >
      {children}
    </StockWiseContext.Provider>
  );
};

export const useStockWise = (): StockWiseContextType => {
  const context = useContext(StockWiseContext);
  if (!context) {
    throw new Error('useStockWise must be used within a StockWiseProvider');
  }
  return context;
};
