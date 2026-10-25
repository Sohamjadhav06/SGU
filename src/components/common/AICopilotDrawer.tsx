import React, { useState } from 'react';
import { useStockWise } from '../../context/StockWiseContext';
import { Drawer, Button } from './UIComponents';
import { askAssistantWithAI } from '../../lib/aiService';
import {
  Bot,
  Send,
  ArrowRight,
  RotateCcw,
  User,
  Sparkles,
} from 'lucide-react';
import { StockWisePage } from '../../types/stockwise';

export const AICopilotDrawer: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    products,
    warehouses,
    stores,
    inventory,
    criticalStockoutsCount,
    excessInventoryItems,
    currentOptimizationResult,
    setCurrentPage,
  } = useStockWise();

  const [inputQuestion, setInputQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [messages, setMessages] = useState<
    {
      id: string;
      sender: 'user' | 'assistant';
      text: string;
      source?: 'gemini' | 'local';
      actions?: { label: string; page: string }[];
    }[]
  >([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Namaste Soham! I am your **VyaparMitra Assistant**. I can answer questions about your inventory levels, low stock shortages, surplus warehouses, and transfer costs across Maharashtra.`,
    },
  ]);

  const quickChips = [
    'Which products need restocking?',
    'Which shops have the lowest stock?',
    'Which warehouses have extra stock?',
    'Why was this transfer recommended?',
    'What is the estimated cost of this transfer?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isAnswering) return;

    const userMsgId = `usr-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: q }]);
    setInputQuestion('');
    setIsAnswering(true);

    try {
      const response = await askAssistantWithAI(q, {
        products,
        warehouses,
        stores,
        inventory,
        criticalStockoutsCount,
        excessInventoryItemsCount: excessInventoryItems.length,
        totalFreightCost: currentOptimizationResult?.totalEstimatedCost || 14250,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: response.answer,
          source: response.source,
          actions: response.relatedActions,
        },
      ]);
    } catch {
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: `VyaparMitra tracks ${products.length} products across 3 warehouses and 6 stores in Maharashtra. Current status: ${criticalStockoutsCount} low stock alerts.`,
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'init-1',
        sender: 'assistant',
        text: `Chat reset. Ask me about stock shortages, extra inventory, or transfer routes across Maharashtra.`,
      },
    ]);
  };

  return (
    <Drawer
      isOpen={isCopilotOpen}
      onClose={() => setIsCopilotOpen(false)}
      title="VyaparMitra Assistant"
      subtitle="Inventory & distribution intelligence for Maharashtra operations"
      width="lg"
    >
      <div className="flex flex-col h-full justify-between font-sans">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#172B45] text-white'
                    : 'bg-[#2864E8] text-white shadow-2xs'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-[#2864E8] text-white rounded-tr-none shadow-xs'
                    : 'bg-[#F0F7FF] border border-[#D5E5F7] text-[#172B45] rounded-tl-none'
                }`}
              >
                <div
                  className="space-y-1.5"
                  dangerouslySetInnerHTML={{
                    __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />

                {msg.source && (
                  <div className="mt-2 pt-1 border-t border-[#D5E5F7]/60 text-[10px] text-[#627A96] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#2864E8]" />
                    <span>{msg.source === 'gemini' ? 'Google Gemini AI' : 'Deterministic Engine'}</span>
                  </div>
                )}

                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#D5E5F7] flex flex-wrap gap-1.5">
                    {msg.actions.map((act) => (
                      <button
                        key={act.page}
                        onClick={() => {
                          setCurrentPage(act.page as StockWisePage);
                          setIsCopilotOpen(false);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-600/30 text-[#2864E8] rounded-md text-[11px] font-medium hover:bg-[#EAF4FF] transition-colors cursor-pointer"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAnswering && (
            <div className="flex items-center gap-2 text-xs text-[#627A96] italic p-2">
              <Bot className="w-4 h-4 text-[#2864E8] animate-spin" />
              <span>Analyzing live inventory records...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="mt-4 pt-3 border-t border-[#D5E5F7]">
          {/* Quick query chips */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Common Questions
              </span>
              <button
                onClick={handleResetChat}
                className="text-[10px] text-slate-400 hover:text-[#172B45] flex items-center gap-1 cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={isAnswering}
                  className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-[#EAF4FF] hover:text-[#1D4ED8] text-[#172B45] rounded-full border border-transparent hover:border-blue-200 transition-all text-left truncate max-w-full cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input text box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask about stock, demand, or transfers..."
              disabled={isAnswering}
              className="flex-1 h-9 px-3 bg-[#F0F7FF] border border-[#D5E5F7] rounded-lg text-xs sm:text-sm text-[#172B45] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <Button
              type="submit"
              size="md"
              variant="primary"
              disabled={!inputQuestion.trim() || isAnswering}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Ask
            </Button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Answers are grounded in live Maharashtra inventory records and validated calculations.
          </p>
        </div>
      </div>
    </Drawer>
  );
};
