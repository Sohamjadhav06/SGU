import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

function geminiServerPlugin(): Plugin {
  return {
    name: 'gemini-server-plugin',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '');
      const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
      const modelName = process.env.GEMINI_MODEL || env.GEMINI_MODEL || 'gemini-2.5-flash';

      server.middlewares.use('/api/gemini/chat', async (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const { question, context } = parsed;

            if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  ok: false,
                  fallback: true,
                  message: 'Gemini API key is not configured in .env. Using deterministic business intelligence engine.',
                })
              );
              return;
            }

            // Dynamically import @google/genai to avoid bundling into frontend
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

            const prompt = `You are VyaparMitra AI Assistant, a concise, professional inventory and distribution intelligence specialist for an Indian retail and warehouse supply network in Maharashtra.
Answer the user's question using ONLY the provided real inventory data and deterministic calculations.
Do NOT invent fake stock numbers, costs, or locations. Keep your tone professional, practical, and clear.

CURRENT INVENTORY & NETWORK STATUS:
- Total Products: ${context?.productsCount ?? 6}
- Critical Stockouts: ${context?.criticalStockoutsCount ?? 2} (Kothrud Digital Store - Portronics Charger, Andheri Electronics - boAt Earbuds)
- Facilities with Extra Stock: ${context?.excessInventoryCount ?? 2} (Pune Central Warehouse, Mumbai Distribution Centre)
- Active Warehouses: Pune Central Warehouse, Mumbai Distribution Centre, Nagpur Storage Hub
- Active Retail Stores: Shivaji Nagar Electronics, Kothrud Digital Store, Andheri Electronics, Thane Smart Retail, Nashik Tech Mart, Dharampeth Digital Store
- Estimated Delivery Savings: ₹42,850

USER QUESTION:
"${question}"

Provide a direct, practical response in 2-4 sentences. Use Indian Rupee (₹) symbols if discussing financial numbers.`;

            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
            });

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                ok: true,
                answer: response.text,
                modelUsed: modelName,
              })
            );
          } catch (error: any) {
            console.error('[Gemini Server Plugin] Generation failed:', error?.message || error);
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                ok: false,
                fallback: true,
                error: error?.message || 'Gemini service unavailable',
              })
            );
          }
        });
      });

      server.middlewares.use('/api/gemini/explain', async (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const { params } = parsed;

            if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  ok: false,
                  fallback: true,
                  message: 'Gemini API key is not configured in .env. Using deterministic explanation.',
                })
              );
              return;
            }

            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

            const prompt = `You are VyaparMitra, an Indian distribution logistics intelligence engine.
Explain the following inventory redistribution decision in simple, professional business terms.
Do NOT change the quantity, cost, or feasibility metrics. Ground your reasoning strictly in the data.

INPUT DATA:
- Product: ${params?.productName} (${params?.sku})
- Source Warehouse: ${params?.sourceName} (Available stock: ${params?.sourceAvailableStock}, Safety reserve: ${params?.sourceSafetyStock})
- Destination Store: ${params?.destName} (Current stock on hand: ${params?.destCurrentStock}, Days remaining: ${params?.destDaysRemaining ?? 'Unknown'})
- Recommended Transfer: ${params?.quantity} units
- Estimated Delivery Cost: ₹${params?.cost}
- Reason Codes: ${(params?.reasonCodes || []).join(', ')}

Return a strict JSON object with these keys:
{
  "summary": "1-2 sentence simple executive briefing",
  "mainReason": "Clear rationale explaining why stock is being sent",
  "keyAssumptions": ["bullet 1", "bullet 2"],
  "limitationsAndWarnings": ["bullet 1"],
  "humanReadableSummary": "Quick planner summary"
}`;

            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
            });

            const text = response.text || '';
            let jsonOutput = null;
            try {
              const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
              jsonOutput = JSON.parse(cleaned);
            } catch {
              jsonOutput = {
                summary: text,
                mainReason: 'Optimized stock replenishment to prevent stockout.',
                keyAssumptions: ['Road delivery via Maharashtra corridor'],
                limitationsAndWarnings: ['Requires warehouse dispatch confirmation'],
                humanReadableSummary: text.slice(0, 100),
              };
            }

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                ok: true,
                explanation: jsonOutput,
                modelUsed: modelName,
              })
            );
          } catch (error: any) {
            console.error('[Gemini Server Plugin] Explanation failed:', error?.message || error);
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                ok: false,
                fallback: true,
                error: error?.message || 'Gemini service unavailable',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    geminiServerPlugin(),
  ],
});
