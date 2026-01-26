
import React, { useState, useRef, useEffect } from 'react';
import { Purchase, MenuItem, TablePayments } from '../types';

interface PurchasesManagerProps {
  menu: MenuItem[];
  purchases: Purchase[];
  onUpdate: (purchases: Purchase[]) => void;
  onBack: () => void;
}

const PurchasesManager: React.FC<PurchasesManagerProps> = ({ menu, purchases, onUpdate, onBack }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<keyof TablePayments>('cash');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const addPurchase = () => {
    const amt = parseFloat(amount);
    if (!description.trim() || isNaN(amt) || amt <= 0) return;

    const newPurchase: Purchase = {
      id: crypto.randomUUID(),
      description: description.trim().toUpperCase(),
      amount: amt,
      method: method,
      createdAt: Date.now()
    };
    onUpdate([newPurchase, ...purchases]);
    setDescription('');
    setAmount('');
  };

  const deletePurchase = (id: string) => {
    onUpdate(purchases.filter(p => p.id !== id));
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2 
  });

  const filteredSuggestions = menu.filter(item => 
    item.name.toLowerCase().includes(description.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const methodColors: Record<string, string> = {
    cash: 'bg-green-600',
    pix: 'bg-yellow-500',
    debit: 'bg-sky-500',
    credit: 'bg-purple-500'
  };

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-4 md:p-6 border border-gray-800 animate-in fade-in duration-300 overflow-visible">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[24px] md:text-[32px] font-bold text-white uppercase tracking-wider">Compras</h1>
        </div>
      </div>

      <div className="bg-[#242424] p-4 md:p-6 rounded-lg border border-gray-800 mb-6 md:mb-8 overflow-visible shadow-lg">
        <h2 className="text-gray-400 uppercase font-black mb-4 text-[14px] md:text-[18px]">Nueva Compra / Gasto</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Descripción del gasto..." 
                className="bg-gray-800 border-none rounded-lg p-3 md:p-4 w-full text-white text-[18px] md:text-[24px] focus:ring-2 focus:ring-yellow-500 outline-none uppercase font-bold"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {showSuggestions && description.trim().length > 0 && filteredSuggestions.length > 0 && (
                <div ref={suggestionRef} className="absolute left-0 right-0 top-full mt-1 bg-[#2d2d2d] border-2 border-yellow-500 rounded-lg shadow-2xl z-[9999] max-h-64 md:max-h-80 overflow-y-auto no-scrollbar">
                  {filteredSuggestions.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setDescription(item.name);
                        setShowSuggestions(false);
                      }} 
                      className="p-3 hover:bg-yellow-500 hover:text-black cursor-pointer flex justify-between items-center border-b border-gray-800 last:border-none transition-colors"
                    >
                      <span className="font-black text-[14px] md:text-[18px] uppercase">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input 
              type="number" 
              step="0.01"
              placeholder="Monto R$" 
              className="bg-gray-800 border-none rounded-lg p-3 md:p-4 w-full md:w-48 text-right text-white text-[18px] md:text-[24px] font-mono focus:ring-2 focus:ring-yellow-500 outline-none font-black"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
              <button onClick={() => setMethod('cash')} className={`p-3 rounded-lg font-black text-[14px] md:text-[18px] transition-all uppercase border-2 ${method === 'cash' ? 'bg-green-600 border-white text-white scale-105 shadow-lg' : 'bg-gray-800 border-transparent text-gray-500'}`}>EFECTIVO</button>
              <button onClick={() => setMethod('pix')} className={`p-3 rounded-lg font-black text-[14px] md:text-[18px] transition-all uppercase border-2 ${method === 'pix' ? 'bg-yellow-500 border-white text-black scale-105 shadow-lg' : 'bg-gray-800 border-transparent text-gray-500'}`}>PIX</button>
              <button onClick={() => setMethod('debit')} className={`p-3 rounded-lg font-black text-[14px] md:text-[18px] transition-all uppercase border-2 ${method === 'debit' ? 'bg-sky-500 border-white text-white scale-105 shadow-lg' : 'bg-gray-800 border-transparent text-gray-500'}`}>DÉBITO</button>
              <button onClick={() => setMethod('credit')} className={`p-3 rounded-lg font-black text-[14px] md:text-[18px] transition-all uppercase border-2 ${method === 'credit' ? 'bg-purple-500 border-white text-white scale-105 shadow-lg' : 'bg-gray-800 border-transparent text-gray-500'}`}>CRÉDITO</button>
            </div>
            <button 
              onClick={addPurchase}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-black px-12 py-4 rounded-lg transition-all text-[18px] md:text-[22px] uppercase shrink-0 active:scale-95 shadow-lg"
            >
              Registrar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[320px]">
            <thead className="bg-[#2d2d2d] text-gray-400 text-[11px] md:text-[19px] uppercase font-black">
              <tr>
                <th className="p-2 md:p-5">Gasto</th>
                <th className="p-2 md:p-5 text-center">Pago</th>
                <th className="p-2 md:p-5 text-right">Monto</th>
                <th className="p-2 md:p-5 w-10 md:w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {purchases.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-2 md:p-5 text-white font-bold text-[14px] md:text-[28px] uppercase tracking-tighter truncate max-w-[120px] md:max-w-none">
                    {p.description}
                  </td>
                  <td className="p-2 md:p-5 text-center">
                    <span className={`${methodColors[p.method]} ${p.method === 'pix' ? 'text-black' : 'text-white'} px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[16px] font-black uppercase shadow-sm`}>
                      {p.method === 'cash' ? 'EFE' : p.method.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2 md:p-5 text-right text-red-400 font-black font-mono text-[14px] md:text-[28px] whitespace-nowrap">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="p-2 md:p-5 text-center">
                    <button onClick={() => deletePurchase(p.id)} className="text-gray-600 hover:text-red-500 p-1 md:p-2 transition-all active:scale-90">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 md:p-20 text-center text-gray-600 text-[16px] md:text-[24px] font-black uppercase tracking-widest opacity-50">
                    Sin gastos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchasesManager;
