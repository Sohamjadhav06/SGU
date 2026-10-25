import React, { useState, useMemo } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Product } from '../../types/stockwise';
import { formatINR } from '../../lib/formatters';
import {
  Button,
  Badge,
  Card,
  SearchInput,
  Modal,
  Drawer,
  EmptyState,
  Pagination,
} from '../common/UIComponents';
import {
  Plus,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  Building2,
  Store as StoreIcon,
  Package,
  Layers,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    inventory,
    warehouses,
    stores,
    stockoutAlerts,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustInventoryStock,
  } = useStockWise();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Selection state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Success message banner state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state for Add / Edit Product
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Electronics',
    unitCost: 1000,
    sellingPrice: 1500,
    weightKg: 0.5,
    minSafetyStock: 20,
    maxStock: 200,
    leadTimeDays: 2,
    isPerishable: false,
    expiryDate: '',
    description: '',
    unitOfMeasure: 'Units',
  });

  // Adjust stock state
  const [adjustData, setAdjustData] = useState({
    productId: products[0]?.id || '',
    locationId: warehouses[0]?.id || '',
    deltaQty: 20,
    notes: 'Warehouse restocking receipt',
  });

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Combined product + stock calculations
  const productRows = useMemo(() => {
    return products.map((prod) => {
      const items = inventory.filter((i) => i.productId === prod.id);
      const totalStock = items.reduce((sum, item) => sum + item.quantityOnHand, 0);

      // Average daily sales across stores
      const matchingAlerts = stockoutAlerts.filter((a) => a.product.id === prod.id);
      const avgDailySales =
        matchingAlerts.length > 0
          ? matchingAlerts.reduce((sum, a) => sum + a.avgDailyDemand, 0) / matchingAlerts.length
          : 8.5;

      // Status determination
      let status: 'healthy' | 'low' | 'stockout' = 'healthy';
      let statusText = 'In-Stock';

      const criticalAlert = matchingAlerts.find(
        (a) => a.daysRemaining !== null && a.daysRemaining <= 2
      );
      const warningAlert = matchingAlerts.find(
        (a) => a.daysRemaining !== null && a.daysRemaining <= 5
      );

      if (criticalAlert) {
        status = 'stockout';
        statusText = 'Critical Shortage';
      } else if (warningAlert || totalStock < prod.minSafetyStock * 2) {
        status = 'low';
        statusText = 'Low Stock';
      }

      // Location description
      const primaryLoc = items.find((i) => i.quantityOnHand > 0);
      let locationText = 'Multi-facility';
      if (primaryLoc) {
        const wh = warehouses.find((w) => w.id === primaryLoc.locationId);
        const st = stores.find((s) => s.id === primaryLoc.locationId);
        locationText = wh ? wh.city : st ? st.city : 'Maharashtra Hubs';
      }

      return {
        ...prod,
        availableStock: totalStock,
        dailySales: avgDailySales,
        status,
        statusText,
        locationText,
      };
    });
  }, [products, inventory, stockoutAlerts, warehouses, stores]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return productRows.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

      const matchesLoc =
        selectedLocation === 'all' ||
        inventory.some(
          (inv) => inv.productId === p.id && inv.locationId === selectedLocation && inv.quantityOnHand > 0
        );

      return matchesSearch && matchesCat && matchesLoc;
    });
  }, [productRows, search, selectedCategory, selectedLocation, inventory]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(paginatedRows.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add Product Modal open
  const handleOpenAdd = () => {
    setFormData({
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Electronics',
      unitCost: 1000,
      sellingPrice: 1600,
      weightKg: 0.5,
      minSafetyStock: 25,
      maxStock: 250,
      leadTimeDays: 2,
      isPerishable: false,
      expiryDate: '',
      description: 'Indian retail inventory product.',
      unitOfMeasure: 'Units',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Submit Add
  const handleSaveAdd = () => {
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setFormError('SKU code is required.');
      return;
    }
    if (formData.unitCost <= 0) {
      setFormError('Unit cost must be greater than zero.');
      return;
    }

    addProduct({
      ...formData,
    });

    setIsAddModalOpen(false);
    setSuccessMessage(`Product "${formData.name}" added successfully.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Edit
  const handleOpenEdit = (prod: Product) => {
    setSelectedProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      unitCost: prod.unitCost,
      sellingPrice: prod.sellingPrice,
      weightKg: prod.weightKg,
      minSafetyStock: prod.minSafetyStock,
      maxStock: prod.maxStock,
      leadTimeDays: prod.leadTimeDays,
      isPerishable: prod.isPerishable,
      expiryDate: prod.expiryDate || '',
      description: prod.description,
      unitOfMeasure: prod.unitOfMeasure,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = () => {
    if (!selectedProduct) return;
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    updateProduct(selectedProduct.id, {
      ...formData,
    });

    setIsEditModalOpen(false);
    setSuccessMessage(`Product "${formData.name}" updated successfully.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Adjust Stock
  const handleOpenAdjustStock = (prodId?: string) => {
    setAdjustData({
      productId: prodId || products[0]?.id || '',
      locationId: warehouses[0]?.id || '',
      deltaQty: 25,
      notes: 'Manual inventory intake correction',
    });
    setIsAdjustStockModalOpen(true);
  };

  // Submit Adjust Stock
  const handleSaveAdjustStock = () => {
    adjustInventoryStock(
      adjustData.locationId,
      adjustData.productId,
      adjustData.deltaQty,
      adjustData.notes
    );

    const prod = products.find((p) => p.id === adjustData.productId);
    setIsAdjustStockModalOpen(false);
    setSuccessMessage(
      `Stock adjusted: ${adjustData.deltaQty > 0 ? '+' : ''}${adjustData.deltaQty} units for ${
        prod?.name || 'Product'
      }. Related dashboard metrics have been updated.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Details Drawer
  const handleOpenDetails = (prod: Product) => {
    setSelectedProduct(prod);
    setIsDetailsDrawerOpen(true);
  };

  // Delete product
  const handleDelete = (prod: Product) => {
    if (window.confirm(`Are you sure you want to delete ${prod.name}?`)) {
      deleteProduct(prod.id);
      setSuccessMessage(`Product "${prod.name}" removed from inventory.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Product Name',
      'Category',
      'SKU',
      'Location',
      'Available Stock',
      'Daily Sales',
      'Unit Cost (INR)',
      'Status',
    ];
    const rows = filteredRows.map((r) => [
      `"${r.name}"`,
      `"${r.category}"`,
      `"${r.sku}"`,
      `"${r.locationText}"`,
      r.availableStock,
      r.dailySales.toFixed(1),
      r.unitCost,
      `"${r.statusText}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vyaparmitra_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics for Summary Section (Exact 3-card layout from Reference Image 1)
  const totalStockUnits = useMemo(() => {
    return inventory.reduce((acc, curr) => acc + curr.quantityOnHand, 0);
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return productRows.filter((p) => p.status === 'low' || p.status === 'stockout').length;
  }, [productRows]);

  return (
    <div className="space-y-4 font-sans max-w-7xl mx-auto">
      {/* Page Header (Inspired by Reference Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Inventory
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Manage products, track stock across Maharashtra warehouses and retail shops, and monitor stock status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleOpenAdjustStock()}
            icon={<ArrowUpDown className="w-3 h-3 text-[#2864E8]" />}
          >
            Adjust Stock
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-[#159B68] rounded-lg text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#159B68] shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-[#159B68] hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Small Summary Section (3 Cards in a Row: Reference Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Categories */}
        <Card className="p-3.5 sm:p-4 border border-[#D5E5F7]">
          <div className="text-[11px] font-semibold text-[#2864E8] uppercase tracking-wider">Categories</div>
          <div className="text-xl sm:text-2xl font-bold text-[#172B45] tabular-nums mt-0.5">
            {categories.filter((c) => c !== 'all').length} Categories
          </div>
          <div className="text-[11px] text-[#627A96] mt-0.5">Active catalog categories</div>
        </Card>

        {/* Card 2: Total Product */}
        <Card className="p-3.5 sm:p-4 border border-[#D5E5F7]">
          <div className="text-[11px] font-semibold text-[#D99A13] uppercase tracking-wider">Total Products</div>
          <div className="text-xl sm:text-2xl font-bold text-[#172B45] tabular-nums mt-0.5">
            {products.length} Products ({totalStockUnits.toLocaleString('en-IN')} units)
          </div>
          <div className="text-[11px] text-[#627A96] mt-0.5">9 Maharashtra facilities</div>
        </Card>

        {/* Card 3: Low Stock */}
        <Card className="p-3.5 sm:p-4 border border-[#D5E5F7]">
          <div className="text-[11px] font-semibold text-[#E5484D] uppercase tracking-wider">Low Stock</div>
          <div className="text-xl sm:text-2xl font-bold text-[#172B45] tabular-nums mt-0.5">
            {lowStockCount} Products
          </div>
          <div className="text-[11px] text-[#627A96] mt-0.5">Under safety buffer</div>
        </Card>
      </div>

      {/* Main Content Area: Inventory Items (Reference Image 1) */}
      <Card className="overflow-hidden border border-[#D5E5F7]">
        <div className="p-3.5 sm:p-4 border-b border-[#D5E5F7]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h2 className="text-xs sm:text-sm font-semibold text-[#172B45]">Inventory Items</h2>
            <span className="text-[11px] text-[#627A96]">
              Showing {filteredRows.length} of {products.length} products
            </span>
          </div>

          {/* Search, Filter, Date, and Export Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search input */}
            <div className="w-full md:max-w-xs">
              <SearchInput
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                onClear={() => setSearch('')}
                placeholder="Search product name or SKU..."
              />
            </div>

            {/* Right filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5E5F7] rounded-lg text-xs text-[#172B45]">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories
                    .filter((c) => c !== 'all')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D5E5F7] rounded-lg text-xs text-[#172B45]">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All Facilities</option>
                  <optgroup label="Warehouses">
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Retail Stores">
                    {stores.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Export Button */}
              <Button
                size="sm"
                variant="primary"
                onClick={handleExportCSV}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Clean Inventory Table (Exact columns from Section 6) */}
        {paginatedRows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No products found"
              description="No inventory matches the current search or filters. Try clearing your search or adding a new product."
              action={
                <Button size="sm" variant="secondary" onClick={() => { setSearch(''); setSelectedCategory('all'); setSelectedLocation('all'); }}>
                  Reset Filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#D5E5F7] bg-[#F0F7FF] text-[#627A96] font-semibold text-xs">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedProductIds.length === paginatedRows.length &&
                        paginatedRows.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-[#D5E5F7] text-[#2864E8] focus:ring-[#2864E8] cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4 text-right">Daily Sales</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-[#E4F1FF] transition-colors ${
                        isChecked ? 'bg-[#E4F1FF]' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(prod.id)}
                          className="rounded border-[#D5E5F7] text-[#2864E8] focus:ring-[#2864E8] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-[#D5E5F7] flex items-center justify-center text-[#627A96] shrink-0">
                            <Package className="w-4 h-4 text-[#2864E8]" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#172B45] leading-tight">
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-[#627A96] truncate max-w-[180px]">
                              {prod.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#172B45] font-medium">
                        {prod.category}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-[#627A96]">
                        {prod.sku}
                      </td>

                      <td className="py-3 px-4 text-[#172B45]">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prod.locationText}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-semibold tabular-nums text-[#172B45]">
                        {prod.availableStock.toLocaleString('en-IN')} units
                      </td>

                      <td className="py-3 px-4 text-right tabular-nums text-[#627A96]">
                        {prod.dailySales.toFixed(1)} /day
                      </td>

                      <td className="py-3 px-4 text-right font-medium tabular-nums text-[#172B45]">
                        {formatINR(prod.unitCost)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge variant={prod.status} size="sm">
                          {prod.statusText}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAdjustStock(prod.id)}
                            className="p-1.5 rounded-lg text-[#627A96] hover:text-[#2864E8] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
                            title="Quick Adjust Stock"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenDetails(prod)}
                            className="p-1.5 rounded-lg text-[#627A96] hover:text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
                            title="View Facility Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg text-[#627A96] hover:text-[#172B45] hover:bg-[#EAF4FF] transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Clean Table Pagination (Reference Image 1) */}
        {filteredRows.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRows.length}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </Card>

      {/* ======================================================== */}
      {/* MODAL 1: ADD PRODUCT                                     */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
        subtitle="Register a new SKU for distribution across Maharashtra"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save Product
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. boAt Wave Smartwatch"
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">SKU Code *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SKU-BOAT-02"
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Networking">Networking</option>
                <option value="Power">Power</option>
                <option value="Audio">Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">Unit of Measure</label>
              <input
                type="text"
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Unit Cost (₹) *</label>
              <input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">Min Safety Stock</label>
              <input
                type="number"
                value={formData.minSafetyStock}
                onChange={(e) => setFormData({ ...formData, minSafetyStock: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: EDIT PRODUCT                                    */}
      {/* ======================================================== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product Details"
        subtitle={`Updating ${selectedProduct?.name || 'Product'}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">SKU Code</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#172B45] font-medium mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">Selling Price (₹)</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[#172B45] font-medium mb-1">Min Safety Stock</label>
              <input
                type="number"
                value={formData.minSafetyStock}
                onChange={(e) => setFormData({ ...formData, minSafetyStock: Number(e.target.value) })}
                className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: QUICK ADJUST STOCK                              */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAdjustStockModalOpen}
        onClose={() => setIsAdjustStockModalOpen(false)}
        title="Adjust Inventory Stock"
        subtitle="Perform stock intake, physical audit adjustments, or loss write-offs"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAdjustStockModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdjustStock}>
              Update Inventory
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-[#172B45] font-medium mb-1">Select Product</label>
            <select
              value={adjustData.productId}
              onChange={(e) => setAdjustData({ ...adjustData, productId: e.target.value })}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Location / Facility</label>
            <select
              value={adjustData.locationId}
              onChange={(e) => setAdjustData({ ...adjustData, locationId: e.target.value })}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            >
              <optgroup label="Warehouses">
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.city})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Retail Stores">
                {stores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">
              Quantity Change (+ to Add, - to Subtract)
            </label>
            <input
              type="number"
              value={adjustData.deltaQty}
              onChange={(e) => setAdjustData({ ...adjustData, deltaQty: Number(e.target.value) })}
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none tabular-nums font-semibold"
            />
            <p className="text-[11px] text-[#627A96] mt-1">
              Positive values record an inbound stock intake; negative values record a physical audit reduction.
            </p>
          </div>

          <div>
            <label className="block text-[#172B45] font-medium mb-1">Reason / Notes</label>
            <input
              type="text"
              value={adjustData.notes}
              onChange={(e) => setAdjustData({ ...adjustData, notes: e.target.value })}
              placeholder="e.g. Supplier delivery PO-9812 or store stock audit"
              className="w-full h-9 px-3 border border-[#D5E5F7] rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* DRAWER: PRODUCT DETAILS & FACILITY BREAKDOWN             */}
      {/* ======================================================== */}
      <Drawer
        isOpen={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        title={selectedProduct?.name || 'Product Details'}
        subtitle={`SKU: ${selectedProduct?.sku || ''} · Category: ${selectedProduct?.category || ''}`}
        width="lg"
      >
        {selectedProduct && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Commercial Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Unit Cost</span>
                <div className="text-base font-semibold text-[#172B45] mt-0.5 tabular-nums">
                  {formatINR(selectedProduct.unitCost)}
                </div>
              </div>

              <div className="p-3 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Selling Price</span>
                <div className="text-base font-semibold text-[#172B45] mt-0.5 tabular-nums">
                  {formatINR(selectedProduct.sellingPrice)}
                </div>
              </div>

              <div className="p-3 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Safety Buffer</span>
                <div className="text-base font-semibold text-[#172B45] mt-0.5 tabular-nums">
                  {selectedProduct.minSafetyStock} units
                </div>
              </div>

              <div className="p-3 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg">
                <span className="text-[10px] text-[#627A96] uppercase font-semibold">Lead Time</span>
                <div className="text-base font-semibold text-[#172B45] mt-0.5 tabular-nums">
                  {selectedProduct.leadTimeDays} Days
                </div>
              </div>
            </div>

            {/* Warehouse Stock Breakdown */}
            <div>
              <h4 className="font-semibold text-[#172B45] mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2864E8]" />
                <span>Central Warehouses (3 Facilities)</span>
              </h4>
              <div className="border border-[#D5E5F7] rounded-lg overflow-hidden divide-y divide-slate-100">
                {warehouses.map((wh) => {
                  const item = inventory.find(
                    (i) => i.productId === selectedProduct.id && i.locationId === wh.id
                  );
                  const qty = item?.quantityOnHand || 0;
                  return (
                    <div key={wh.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#172B45]">{wh.name}</div>
                        <div className="text-[#627A96] text-[11px]">{wh.city}, Maharashtra</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums text-[#172B45]">
                          {qty.toLocaleString('en-IN')} units
                        </div>
                        <span className="text-[10px] text-slate-400">Available</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Store Stock Breakdown */}
            <div>
              <h4 className="font-semibold text-[#172B45] mb-2 flex items-center gap-1.5">
                <StoreIcon className="w-4 h-4 text-emerald-600" />
                <span>Retail Stores & Shops (6 Locations)</span>
              </h4>
              <div className="border border-[#D5E5F7] rounded-lg overflow-hidden divide-y divide-slate-100">
                {stores.map((st) => {
                  const item = inventory.find(
                    (i) => i.productId === selectedProduct.id && i.locationId === st.id
                  );
                  const qty = item?.quantityOnHand || 0;
                  const alert = stockoutAlerts.find(
                    (a) => a.product.id === selectedProduct.id && a.store.id === st.id
                  );

                  return (
                    <div key={st.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#172B45]">{st.name}</div>
                        <div className="text-[#627A96] text-[11px]">{st.city}, Maharashtra</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums text-[#172B45]">
                          {qty.toLocaleString('en-IN')} units
                        </div>
                        {alert && alert.daysRemaining !== null ? (
                          <span
                            className={`text-[10px] font-semibold ${
                              alert.daysRemaining <= 2
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {alert.daysRemaining.toFixed(1)} days left
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600">Stock safe</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions in Drawer */}
            <div className="pt-4 border-t border-[#D5E5F7] flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDetailsDrawerOpen(false);
                  handleOpenEdit(selectedProduct);
                }}
              >
                Edit Product
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailsDrawerOpen(false);
                  handleOpenAdjustStock(selectedProduct.id);
                }}
              >
                Adjust Stock
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
