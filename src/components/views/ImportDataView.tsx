import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Button, Card, AlertBanner, Badge } from '../common/UIComponents';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../../types/stockwise';

export const ImportDataView: React.FC = () => {
  const { importCSVProducts, setCurrentPage } = useStockWise();

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  const sampleCsvTemplate = `sku,name,category,unitCost,sellingPrice,minSafetyStock,leadTimeDays,isPerishable,description
ELC-AIR-PRO,boAt Rockerz Bluetooth Headphones,Electronics,999.00,1999.00,35,2,false,Wireless bluetooth neckband earphones
ELC-CAB-65W,Portronics Fast Charging Braided Cable,Electronics,299.00,599.00,40,1,false,Type-C 65W fast charge cable
ELC-PWR-20K,Ambrane 20000mAh Power Bank,Electronics,1099.00,2199.00,30,2,false,High capacity fast charging portable power pack
ELC-MOU-OPT,Logitech Silent Optical Mouse,Electronics,450.00,899.00,25,2,false,Ergonomic high-precision office mouse`;

  const handleLoadSample = () => {
    setRawText(sampleCsvTemplate);
  };

  const handleParse = () => {
    const lines = rawText.trim().split('\n');
    if (lines.length <= 1) {
      alert('Please provide valid CSV content with a header row.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map((v) => v.trim());
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setStep(2);
  };

  const handleExecuteImport = () => {
    const productsToImport: Omit<Product, 'id'>[] = parsedRows.map((r) => ({
      sku: r.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: r.name || 'Unnamed Product',
      category: r.category || 'Electronics',
      unitCost: parseFloat(r.unitcost) || 100,
      sellingPrice: parseFloat(r.sellingprice) || 180,
      weightKg: 0.5,
      minSafetyStock: parseInt(r.minsafetystock, 10) || 20,
      maxStock: 250,
      leadTimeDays: parseInt(r.leadtimedays, 10) || 2,
      isPerishable: r.isperishable === 'true',
      description: r.description || '',
      unitOfMeasure: 'Units',
    }));

    const result = importCSVProducts(productsToImport);
    setImportSummary(result);
    setStep(3);
  };

  const handleReset = () => {
    setRawText('');
    setParsedRows([]);
    setImportSummary(null);
    setStep(1);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
            Import Data
          </h1>
          <p className="text-xs text-[#627A96] mt-0.5">
            Batch import product catalogs and inventory records into the Maharashtra distribution network.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
              icon={<RotateCcw className="w-3.5 h-3.5 text-[#627A96]" />}
            >
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            step === 1
              ? 'bg-white border-blue-600 text-[#2864E8] shadow-2xs'
              : 'bg-[#F0F7FF] border-[#D5E5F7] text-slate-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2864E8] flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Paste / Upload CSV</span>
        </div>

        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            step === 2
              ? 'bg-white border-blue-600 text-[#2864E8] shadow-2xs'
              : 'bg-[#F0F7FF] border-[#D5E5F7] text-slate-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2864E8] flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Preview & Validate</span>
        </div>

        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            step === 3
              ? 'bg-white border-blue-600 text-[#2864E8] shadow-2xs'
              : 'bg-[#F0F7FF] border-[#D5E5F7] text-slate-400'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-[#2864E8] flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Import Summary</span>
        </div>
      </div>

      {/* Step 1: Input */}
      {step === 1 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#172B45] flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-[#2864E8]" />
              <span>Paste CSV Records</span>
            </h3>
            <Button size="sm" variant="outline" onClick={handleLoadSample}>
              Load Sample Maharashtra Data
            </Button>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="sku,name,category,unitCost,sellingPrice,minSafetyStock,leadTimeDays,isPerishable,description&#10;..."
            className="w-full p-3 font-mono text-xs border border-[#D5E5F7] rounded-lg focus:outline-none focus:border-blue-600 bg-[#F0F7FF]"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="primary"
              size="md"
              disabled={!rawText.trim()}
              onClick={handleParse}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Parse & Validate Columns
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#172B45]">
                Data Preview ({parsedRows.length} Rows Detected)
              </h3>
              <p className="text-xs text-[#627A96]">
                Confirm your column mappings before committing to the inventory catalog.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleExecuteImport}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Commit to Database
            </Button>
          </div>

          <div className="overflow-x-auto border border-[#D5E5F7] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F7FF] border-b border-[#D5E5F7] text-[#627A96] font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Unit Cost (₹)</th>
                  <th className="py-2.5 px-3 text-right">Selling Price (₹)</th>
                  <th className="py-2.5 px-3 text-right">Min Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#E4F1FF]">
                    <td className="py-2.5 px-3 font-mono font-semibold text-[#172B45]">{r.sku}</td>
                    <td className="py-2.5 px-3 text-[#172B45] font-medium">{r.name}</td>
                    <td className="py-2.5 px-3 text-[#627A96]">{r.category}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#172B45]">₹{r.unitcost}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#172B45]">₹{r.sellingprice}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#627A96]">{r.minsafetystock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Step 3: Result Summary */}
      {step === 3 && importSummary && (
        <Card className="p-6 space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#172B45]">Import Complete</h3>
            <p className="text-xs text-[#627A96] mt-1">
              Successfully ingested {importSummary.successCount} products into the VyaparMitra catalog.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCurrentPage('products')}>
              View in Inventory Table
            </Button>
            <Button variant="primary" onClick={() => setCurrentPage('dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
