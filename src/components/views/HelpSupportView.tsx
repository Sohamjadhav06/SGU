import React from 'react';
import { Card, Badge } from '../common/UIComponents';
import {
  BookOpen,
  Calculator,
  ShieldCheck,
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const formulas = [
    {
      title: 'Estimated Days of Stock Remaining',
      formula: 'Days Remaining = Available Stock / Average Daily Sales',
      notes:
        'If average daily sales is zero or negative, the formula guards against division by zero and falls back to comparing available stock directly against safety buffers.',
    },
    {
      title: 'Extra Stock Quantity',
      formula: 'Extra Units = Math.max(0, (Quantity on Hand - Reserved) - Target Stock Level)',
      notes:
        'Target stock level is calibrated to target days of supply (e.g., 21 days * average daily sales) or safety stock buffer.',
    },
    {
      title: 'Annual Holding Cost Impact',
      formula: 'Carrying Loss (₹/yr) = Extra Units × Unit Cost (₹) × Holding Cost Rate Annual (18%)',
      notes:
        'Calculates real working capital tied up by overstocking products at locations with low customer velocity.',
    },
    {
      title: 'Delivery Route Cost Calculation',
      formula: 'Delivery Cost (₹) = Route Base Cost + (Transfer Quantity × Cost Per Unit)',
      notes:
        'Reflects verified Maharashtra road transport costs based on highway distance and freight rates.',
    },
  ];

  const faqs = [
    {
      q: 'Does VyaparMitra rely on AI models to invent inventory quantities?',
      a: 'No. All transfer quantities, stock shortage predictions, and route costs are calculated via deterministic, verified algorithms. AI models like Google Gemini are strictly utilized for natural language business summaries and explaining results.',
    },
    {
      q: 'What happens if a warehouse runs out of stock or breaches safety buffer limits?',
      a: 'The engine dynamically calculates free stock as (Quantity on Hand - Reserved - Safety Stock Buffer). If a source warehouse cannot fulfill the transfer without breaching its buffer, alternative Maharashtra distribution centers are evaluated.',
    },
    {
      q: 'How does Distribution Plan Comparison work?',
      a: 'The engine compares current stockout risks, holding costs, and fulfillment rates against the optimized transfer schedule to calculate estimated delivery savings and service level improvements.',
    },
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-0.5">
        <h1 className="text-lg sm:text-xl font-bold text-[#172B45] tracking-tight">
          Help & Guide
        </h1>
        <p className="text-xs text-[#627A96] mt-0.5">
          Mathematical formulas, shortage prediction rules, and distribution architecture guides.
        </p>
      </div>

      {/* Verified Mathematical Formulas */}
      <Card className="p-4 sm:p-5 space-y-3.5 border border-[#D5E5F7]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#2864E8]" />
            <span>Deterministic Business Formulas</span>
          </h3>
          <Badge variant="healthy" size="sm">
            Audited & Compliant
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulas.map((f, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[#D5E5F7] bg-[#F0F7FF]/50 space-y-2">
              <h4 className="font-semibold text-xs text-[#172B45]">{f.title}</h4>
              <div className="p-2.5 bg-white border border-[#D5E5F7] rounded-lg font-mono text-[11px] text-[#1D4ED8] font-semibold break-words">
                {f.formula}
              </div>
              <p className="text-[11px] text-[#627A96] leading-relaxed">{f.notes}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Frequently Asked Questions */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#172B45] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2864E8]" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-3.5 rounded-lg border border-[#D5E5F7] bg-[#F0F7FF]/30 space-y-1 text-xs">
              <h5 className="font-semibold text-[#172B45]">{faq.q}</h5>
              <p className="text-[#627A96] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
