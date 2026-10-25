-- ====================================================================
-- VYAPARMITRA: Enterprise PostgreSQL Schema for Supabase
-- AI-Assisted Multi-Echelon Distribution & Inventory Optimization Platform
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean slate if previously run
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS redistribution_recommendations CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS route_costs CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- A. Products Catalog
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    weight_kg NUMERIC(8, 2) DEFAULT 0.5,
    min_safety_stock INT DEFAULT 20,
    max_stock INT DEFAULT 200,
    lead_time_days INT DEFAULT 2,
    is_perishable BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    description TEXT,
    unit_of_measure TEXT DEFAULT 'Units',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. Warehouses (Central & Regional Distribution Centers)
CREATE TABLE warehouses (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'warehouse',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    total_capacity_units INT NOT NULL,
    used_capacity_units INT NOT NULL,
    operating_cost_per_day NUMERIC(10, 2) NOT NULL,
    manager_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'maintenance')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. Stores & Retail Distributors
CREATE TABLE stores (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'store',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    priority_tier TEXT CHECK (priority_tier IN ('flagship', 'standard', 'express')) DEFAULT 'standard',
    daily_footfall INT DEFAULT 500,
    manager_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'closed')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- D. Inventory Items (Product-Location Junction)
CREATE TABLE inventory_items (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id TEXT NOT NULL,
    location_type TEXT CHECK (location_type IN ('warehouse', 'store')) NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    reorder_point INT NOT NULL DEFAULT 20,
    safety_stock INT NOT NULL DEFAULT 15,
    target_stock_level INT NOT NULL DEFAULT 100,
    last_restocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    batch_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E. Route & Logistics Freight Costs (Maharashtra Transit Network)
CREATE TABLE route_costs (
    id TEXT PRIMARY KEY,
    source_warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    destination_location_id TEXT NOT NULL,
    distance_km NUMERIC(8, 2) NOT NULL,
    base_cost NUMERIC(10, 2) NOT NULL,
    cost_per_unit NUMERIC(8, 2) NOT NULL,
    estimated_hours NUMERIC(6, 2) NOT NULL,
    carrier_name TEXT NOT NULL,
    reliability_rate NUMERIC(4, 2) DEFAULT 0.95
);

-- F. Stock Movements & Audit Ledger
CREATE TABLE stock_movements (
    id TEXT PRIMARY KEY,
    movement_number TEXT UNIQUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    source_location_id TEXT,
    destination_location_id TEXT,
    type TEXT CHECK (type IN ('transfer', 'inbound', 'outbound', 'adjustment')) NOT NULL,
    quantity INT NOT NULL,
    reference_doc TEXT,
    initiated_by TEXT NOT NULL,
    status TEXT CHECK (status IN ('completed', 'in_transit', 'cancelled')) DEFAULT 'completed',
    notes TEXT
);

-- G. Shipments & In-Transit Telemetry
CREATE TABLE shipments (
    id TEXT PRIMARY KEY,
    shipment_number TEXT UNIQUE NOT NULL,
    source_warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    destination_store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    status TEXT CHECK (status IN ('pending', 'in_transit', 'delivered', 'delayed')) DEFAULT 'in_transit',
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery_at TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_delivery_at TIMESTAMP WITH TIME ZONE,
    carrier_name TEXT NOT NULL,
    tracking_number TEXT,
    total_units INT NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    driver_name TEXT,
    driver_phone TEXT
);

-- H. Redistribution Recommendations (Prescriptive Output)
CREATE TABLE redistribution_recommendations (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    source_location_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    destination_location_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    recommended_quantity INT NOT NULL,
    estimated_cost NUMERIC(10, 2) NOT NULL,
    transit_days INT DEFAULT 1,
    priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'dispatched')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- I. Notifications & Alerts
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('critical', 'warning', 'info')) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    link_page TEXT,
    action_label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Enables open read/write for web client demo access
-- ====================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE redistribution_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted anonymous & authenticated access for rapid frontend prototyping
CREATE POLICY "Public Products Access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Warehouses Access" ON warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Stores Access" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Inventory Access" ON inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public RouteCosts Access" ON route_costs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Movements Access" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Shipments Access" ON shipments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Recommendations Access" ON redistribution_recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Notifications Access" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 4. SEED DATA (Maharashtra Logistics Network)
-- ====================================================================

-- 1. Insert Products
INSERT INTO products (id, sku, name, category, unit_cost, selling_price, weight_kg, min_safety_stock, max_stock, lead_time_days, description) VALUES
('prod-1', 'ELEC-CHG-001', 'Portronics USB-C 65W Fast Charger', 'Electronics', 799.00, 1499.00, 0.25, 20, 200, 2, 'GaN multi-port adapter suitable for laptops and smartphones'),
('prod-2', 'ELEC-EAR-002', 'boAt Airdopes 141 Bluetooth Earbuds', 'Electronics', 999.00, 1899.00, 0.15, 25, 250, 3, 'True wireless stereo earbuds with 42H playtime'),
('prod-3', 'WEAR-SMT-003', 'Noise ColorFit Pulse 2 Smartwatch', 'Wearables', 1499.00, 2799.00, 0.18, 15, 150, 2, '1.85 inch display with Bluetooth calling and fitness tracking'),
('prod-4', 'MOBI-SMA-004', 'OnePlus Nord CE 3 Lite 5G (128GB)', 'Smartphones', 16500.00, 19999.00, 0.45, 10, 80, 4, 'Qualcomm Snapdragon 695 5G with 108MP camera'),
('prod-5', 'ELEC-POW-005', 'Mi 20000mAh Power Bank 3i', 'Electronics', 1299.00, 2199.00, 0.48, 20, 180, 2, 'Triple output with 18W fast charging and dual input'),
('prod-6', 'HOME-AIR-006', 'Philips Series 1000i Air Purifier', 'Home Appliances', 8999.00, 12999.00, 4.20, 5, 40, 5, 'HEPA filter removes 99.97% particles down to 0.003 microns');

-- 2. Insert Warehouses
INSERT INTO warehouses (id, code, name, address, city, state, lat, lng, total_capacity_units, used_capacity_units, operating_cost_per_day, manager_name, contact_phone) VALUES
('wh-pune-central', 'WH-PUN-01', 'Pune Central Distribution Hub', 'Plot 42, Bhosari MIDC Industrial Estate', 'Pune', 'Maharashtra', 18.629800, 73.847800, 12000, 8450, 18500.00, 'Rajesh Kulkarni', '+91 98230 11223'),
('wh-mumbai-dc', 'WH-BOM-02', 'Mumbai Metro DC', 'Gala 7, Bhiwandi Logistics Corridor', 'Mumbai', 'Maharashtra', 19.296700, 73.062800, 15000, 11200, 24000.00, 'Sanjay Deshmukh', '+91 98200 44556'),
('wh-nagpur-hub', 'WH-NAG-03', 'Nagpur Multimodal Logistics Hub', 'MIHAN SEZ Cargo Complex', 'Nagpur', 'Maharashtra', 21.058800, 79.026700, 9000, 5300, 14000.00, 'Nitin Wankhede', '+91 97120 77889');

-- 3. Insert Retail Stores
INSERT INTO stores (id, code, name, address, city, state, lat, lng, priority_tier, daily_footfall, manager_name, contact_phone) VALUES
('str-kothrud', 'STR-KOT-01', 'Kothrud Digital Store', 'Shop 14, Karve Road, Near Paud Phata', 'Pune', 'Maharashtra', 18.507400, 73.807700, 'flagship', 850, 'Amol Joshi', '+91 94220 33445'),
('str-andheri', 'STR-AND-02', 'Andheri Electronics Hub', 'Shop 8, SV Road, Near Metro Station', 'Mumbai', 'Maharashtra', 19.119700, 72.846400, 'flagship', 1200, 'Sunita Pillai', '+91 98690 55667'),
('str-nashik', 'STR-NSK-03', 'Nashik Road Megastore', 'Plot 2, College Road Commercial Belt', 'Nashik', 'Maharashtra', 19.997500, 73.789800, 'standard', 620, 'Vikas Patil', '+91 93700 88990'),
('str-thane', 'STR-THA-04', 'Thane Viviana Galleria Store', 'Level 2, Viviana Mall, Eastern Express Hwy', 'Thane', 'Maharashtra', 19.208500, 72.971500, 'standard', 950, 'Pradeep Salunkhe', '+91 98190 22334'),
('str-shivaji-nagar', 'STR-SHV-05', 'Shivaji Nagar Tech Plaza', 'FC Road, Next to Deccan Gymkhana', 'Pune', 'Maharashtra', 18.531400, 73.844600, 'standard', 780, 'Kavita Shinde', '+91 98225 66778'),
('str-nagpur-sitabuldi', 'STR-SIT-06', 'Sitabuldi Electronics Center', 'Main Market Road, Sitabuldi', 'Nagpur', 'Maharashtra', 21.145800, 79.088200, 'standard', 550, 'Rahul Gedam', '+91 98810 99001');

-- 4. Insert Inventory Items (Showing the Exact Real Deficit in Kothrud vs Surplus in Pune Central)
INSERT INTO inventory_items (id, product_id, location_id, location_type, quantity_on_hand, quantity_reserved, reorder_point, safety_stock, target_stock_level) VALUES
-- Portronics Charger: Surplus in Pune WH, Critical Stockout in Kothrud Store!
('inv-1', 'prod-1', 'wh-pune-central', 'warehouse', 235, 10, 50, 40, 70),
('inv-2', 'prod-1', 'str-kothrud', 'store', 6, 0, 20, 15, 60),
('inv-3', 'prod-1', 'wh-mumbai-dc', 'warehouse', 180, 15, 40, 30, 100),
('inv-4', 'prod-1', 'str-andheri', 'store', 48, 5, 25, 20, 70),
-- boAt Earbuds: Low stock in Andheri, Surplus in Mumbai DC
('inv-5', 'prod-2', 'wh-mumbai-dc', 'warehouse', 210, 20, 60, 40, 120),
('inv-6', 'prod-2', 'str-andheri', 'store', 10, 0, 30, 25, 80),
('inv-7', 'prod-2', 'str-kothrud', 'store', 42, 2, 25, 20, 60),
-- OnePlus Nord Smartphone
('inv-8', 'prod-4', 'wh-pune-central', 'warehouse', 65, 5, 20, 15, 40),
('inv-9', 'prod-4', 'str-kothrud', 'store', 18, 1, 10, 8, 25),
('inv-10', 'prod-4', 'str-andheri', 'store', 22, 2, 12, 10, 30);

-- 5. Insert Route Costs
INSERT INTO route_costs (id, source_warehouse_id, destination_location_id, distance_km, base_cost, cost_per_unit, estimated_hours, carrier_name) VALUES
('rc-1', 'wh-pune-central', 'str-kothrud', 18.5, 450.00, 3.50, 0.75, 'Delhivery Local Courier'),
('rc-2', 'wh-pune-central', 'str-shivaji-nagar', 14.2, 400.00, 3.00, 0.50, 'Delhivery Local Courier'),
('rc-3', 'wh-mumbai-dc', 'str-andheri', 36.8, 550.00, 4.00, 1.50, 'Blue Dart Surface Express'),
('rc-4', 'wh-mumbai-dc', 'str-thane', 22.4, 450.00, 3.50, 1.00, 'Blue Dart Surface Express'),
('rc-5', 'wh-pune-central', 'str-nashik', 210.0, 1800.00, 7.50, 5.00, 'V-Trans Regional Logistics');

-- 6. Insert Pre-Calculated Redistribution Recommendations
INSERT INTO redistribution_recommendations (id, product_id, source_location_id, destination_location_id, recommended_quantity, estimated_cost, transit_days, priority, status) VALUES
('rec-1', 'prod-1', 'wh-pune-central', 'str-kothrud', 60, 660.00, 1, 'critical', 'pending'),
('rec-2', 'prod-2', 'wh-mumbai-dc', 'str-andheri', 50, 750.00, 1, 'critical', 'pending'),
('rec-3', 'prod-4', 'wh-pune-central', 'str-shivaji-nagar', 12, 436.00, 1, 'medium', 'pending');

-- 7. Insert Initial Stock Movements
INSERT INTO stock_movements (id, movement_number, product_id, source_location_id, destination_location_id, type, quantity, reference_doc, initiated_by, status, notes) VALUES
('mov-101', 'TRF-2026-0891', 'prod-1', 'wh-pune-central', 'str-kothrud', 'transfer', 40, 'DC-PUN-0891', 'Optimizer Auto-Dispatch', 'completed', 'Urgent stock balancing'),
('mov-102', 'TRF-2026-0892', 'prod-2', 'wh-mumbai-dc', 'str-andheri', 'transfer', 30, 'DC-BOM-0892', 'Sanjay Deshmukh', 'in_transit', 'Direct van delivery'),
('mov-103', 'INB-2026-0415', 'prod-3', NULL, 'wh-pune-central', 'inbound', 150, 'PO-NOISE-4410', 'Rajesh Kulkarni', 'completed', 'Factory consignment received');

-- 8. Insert System Notifications
INSERT INTO notifications (id, title, message, timestamp, severity, read, link_page, action_label) VALUES
('notif-1', 'Critical Stock Shortage: Kothrud', 'Portronics USB-C 65W Fast Charger has only 0.4 days of stock remaining.', '10 mins ago', 'critical', false, 'stockout-alerts', 'View Stockout'),
('notif-2', 'Optimization Plan Generated', 'Calculated 3 cost-effective stock redistribution transfers with ₹42,850 estimated savings.', '1 hour ago', 'info', false, 'redistribution-recommendations', 'Review Plan'),
('notif-3', 'Shipment In-Transit', 'Shipment TRF-2026-0892 is en route from Mumbai DC to Andheri Electronics.', '2 hours ago', 'info', true, 'shipments', 'Track Delivery');
