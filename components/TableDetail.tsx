
import React, { useState, useEffect, useRef } from 'react';
import { Table, Product, TablePayments, PaymentRecord, MenuItem } from '../types';

interface TableDetailProps {
  table: Table;
  menu: MenuItem[];
  onBack: () => void;
  onUpdate: (table: Table) => void;
  onDelete: () => void;
}

const TableDetail: React.FC<TableDetailProps> = ({ table, menu, onBack, onUpdate, onDelete }) => {
  const [editingName, setEditingName] = useState(table.name);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  const isBalcao = table.name === 'BALCAO';

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const productSubtotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const totalPayments = (Object.values(table.payments) as number[]).reduce((a, b) => a + b, 0);
  
  const suggestedTaxa = isBalcao ? 0 : (productSubtotal * 0.10);
  const suggestedTotalValue = productSubtotal + suggestedTaxa;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setActiveSuggestionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      quantity: 1,
      description: '', 
      unitPrice: 0,
      delivered: false,
      createdAt: Date.now()
    };
    onUpdate({ ...table, products: [...table.products, newProduct] });
  };

  const updateProduct = (pid: string, changes: Partial<Product>) => {
    const newProducts = table.products.map(p => p.id === pid ? { ...p, ...changes } : p);
    onUpdate({ ...table, products: newProducts });
  };

  const deleteProduct = (pid: string) => {
    onUpdate({ ...table, products: table.products.filter(p => p.id !== pid) });
  };

  const selectSuggestion = (pid: string, item: MenuItem) => {
    updateProduct(pid, { description: item.name, unitPrice: item.price });
    setActiveSuggestionId(null);
  };

  const addPayment = (method: keyof TablePayments) => {
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newRecord: PaymentRecord = {
      id: crypto.randomUUID(),
      amount: amt,
      method: method
    };

    const newPayments = { ...table.payments, [method]: table.payments[method] + amt };
    const newRecords = [...(table.paymentRecords || []), newRecord];

    onUpdate({ ...table, payments: newPayments, paymentRecords: newRecords });
    setPaymentAmount('');
  };

  const removePayment = (recordId: string) => {
    const record = table.paymentRecords?.find(r => r.id === recordId);
    if (!record) return;

    const newPayments = { ...table.payments, [record.method]: Math.max(0, table.payments[record.method] - record.amount) };
    const newRecords = table.paymentRecords?.filter(r => r.id !== recordId);

    onUpdate({ ...table, payments: newPayments, paymentRecords: newRecords });
  };

  const methodColors: Record<string, string> = {
    cash: 'bg-green-600',
    pix: 'bg-yellow-500',
    debit: 'bg-sky-500',
    credit: 'bg-purple-500'
  };

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-3 md:p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-1">
            {!isBalcao && <span className="text-gray-500 font-bold text-[14px] md:text-[25px]"># {table.number}</span>}
            <input 
              disabled={isBalcao}
              className={`bg-transparent border-b ${isBalcao ? 'border-transparent' : 'border-transparent hover:border-gray-700 focus:border-blue-500'} focus:outline-none font-bold text-[16px] md:text-[29px] text-white px-1 uppercase w-32 md:w-auto`}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => onUpdate({ ...table, name: editingName })}
            />
          </div>
        </div>
        {!isBalcao && (
          <button onClick={onDelete} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg font-bold text-[10px] md:text-[18px] uppercase">
            Eliminar Mesa
          </button>
        )}
      </div>

      <div className="space-y-2 mb-6">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#242424] p-2 md:p-3 rounded-lg border border-gray-800 flex flex-col items-center justify-center">
            <span className="text-[10px] md:text-[14px] uppercase font-black text-gray-500">Subtotal</span>
            <span className="text-[14px] md:text-[24px] font-black font-mono text-white">{formatCurrency(productSubtotal)}</span>
          </div>
          <div className="bg-[#242424] p-2 md:p-3 rounded-lg border border-gray-800 flex flex-col items-center justify-center">
            <span className="text-[10px] md:text-[14px] uppercase font-black text-gray-500">Taxa (Sugerida)</span>
            <span className="text-[14px] md:text-[24px] font-black font-mono text-blue-400">{formatCurrency(suggestedTaxa)}</span>
          </div>
          <div className="bg-[#242424] p-2 md:p-3 rounded-lg border border-gray-800 flex flex-col items-center justify-center">
            <span className="text-[10px] md:text-[14px] uppercase font-black text-gray-500">Precio Sugerido</span>
            <span className="text-[14px] md:text-[24px] font-black font-mono text-green-400">{formatCurrency(suggestedTotalValue)}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 md:gap-2">
          <div className="bg-green-600/10 p-1 md:p-3 rounded-lg border border-green-600/20 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[7px] md:text-[14px] uppercase font-black text-green-500/70 leading-none mb-1 truncate w-full text-center">Efe</span>
            <span className="text-[10px] md:text-[22px] font-black font-mono text-green-500 leading-none truncate w-full text-center">{formatCurrency(table.payments.cash)}</span>
          </div>
          <div className="bg-yellow-500/10 p-1 md:p-3 rounded-lg border border-yellow-500/20 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[7px] md:text-[14px] uppercase font-black text-yellow-500/70 leading-none mb-1 truncate w-full text-center">PIX</span>
            <span className="text-[10px] md:text-[22px] font-black font-mono text-yellow-500 leading-none truncate w-full text-center">{formatCurrency(table.payments.pix)}</span>
          </div>
          <div className="bg-sky-500/10 p-1 md:p-3 rounded-lg border border-sky-500/20 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[7px] md:text-[14px] uppercase font-black text-sky-500/70 leading-none mb-1 truncate w-full text-center">Déb</span>
            <span className="text-[10px] md:text-[22px] font-black font-mono text-sky-500 leading-none truncate w-full text-center">{formatCurrency(table.payments.debit)}</span>
          </div>
          <div className="bg-purple-500/10 p-1 md:p-3 rounded-lg border border-purple-500/20 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[7px] md:text-[14px] uppercase font-black text-purple-500/70 leading-none mb-1 truncate w-full text-center">Cré</span>
            <span className="text-[10px] md:text-[22px] font-black font-mono text-purple-500 leading-none truncate w-full text-center">{formatCurrency(table.payments.credit)}</span>
          </div>
          <div className="bg-blue-600/10 p-1 md:p-3 rounded-lg border border-blue-600/20 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[7px] md:text-[14px] uppercase font-black text-blue-400/70 leading-none mb-1 truncate w-full text-center">Taxa</span>
            <span className="text-[10px] md:text-[22px] font-black font-mono text-blue-400 leading-none truncate w-full text-center">{formatCurrency(table.manualServiceFee)}</span>
          </div>
        </div>
      </div>

      <div className="bg-[#242424] p-3 md:p-4 rounded-lg border border-gray-800 mb-6">
        <div className="flex flex-row items-center gap-2 md:gap-3">
          <input 
            type="number" 
            step="0.01"
            placeholder="Monto"
            className="bg-gray-800 border-2 border-gray-700 rounded-lg p-3 w-24 md:w-48 text-[18px] md:text-[24px] font-black text-white focus:border-blue-500 focus:outline-none shrink-0"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <div className="flex-1 grid grid-cols-4 gap-1 md:gap-3">
            <button onClick={() => addPayment('cash')} className="bg-green-600 hover:bg-green-700 p-3 rounded font-black text-[10px] md:text-[18px] uppercase shadow-lg active:scale-95 transition-all truncate">Efectivo</button>
            <button onClick={() => addPayment('pix')} className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded font-black text-[10px] md:text-[18px] text-black uppercase shadow-lg active:scale-95 transition-all truncate">PIX</button>
            <button onClick={() => addPayment('debit')} className="bg-sky-500 hover:bg-sky-600 p-3 rounded font-black text-[10px] md:text-[18px] uppercase shadow-lg active:scale-95 transition-all truncate">Débito</button>
            <button onClick={() => addPayment('credit')} className="bg-purple-500 hover:bg-purple-600 p-3 rounded font-black text-[10px] md:text-[18px] uppercase shadow-lg active:scale-95 transition-all truncate">Crédito</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          {table.paymentRecords?.map(record => (
            <div key={record.id} className={`${methodColors[record.method]} p-2 md:p-3 rounded-lg flex items-center gap-3 shadow-lg animate-in slide-in-from-left duration-200`}>
              <div className="flex flex-col">
                <span className="text-[7px] md:text-[10px] uppercase font-black opacity-70 leading-none mb-1">{record.method === 'cash' ? 'Efectivo' : record.method.toUpperCase()}</span>
                <span className="text-[12px] md:text-[18px] font-black leading-none">{formatCurrency(record.amount)}</span>
              </div>
              <button onClick={() => removePayment(record.id)} className="bg-black/20 hover:bg-black/40 rounded-full p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-visible relative w-full mb-8 shadow-inner">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-[#2d2d2d] text-gray-400 text-[9px] md:text-[14px] uppercase font-black">
            <tr>
              <th className="p-1 w-6 md:w-10 text-center">OK</th>
              <th className="p-1 w-8 md:w-12 text-center">CC</th>
              <th className="p-1">Item</th>
              <th className="p-1 w-12 md:w-20 text-right">PC</th>
              <th className="p-1 w-12 md:w-24 text-right">TT</th>
              <th className="p-1 w-6 md:w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {table.products.map(prod => {
              const filteredSuggestions = menu.filter(item => 
                item.name.toLowerCase().includes(prod.description.toLowerCase())
              );

              return (
                <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-1">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => updateProduct(prod.id, { delivered: !prod.delivered })}
                        className={`w-5 h-5 md:w-8 md:h-8 rounded flex items-center justify-center transition-all ${prod.delivered ? 'bg-green-600' : 'bg-red-600'} active:scale-90`}
                      >
                        {prod.delivered && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </button>
                    </div>
                  </td>
                  <td className="p-1">
                    <input 
                      type="number" 
                      step="1" 
                      value={prod.quantity} 
                      onChange={(e) => updateProduct(prod.id, { quantity: Number(e.target.value) })} 
                      className="bg-gray-800 border-none rounded p-1 w-full text-center focus:ring-1 focus:ring-blue-500 font-black text-[14px] md:text-[22px]" 
                    />
                  </td>
                  <td className="p-1 relative">
                    <input 
                      type="text" 
                      placeholder="..." 
                      value={prod.description} 
                      onChange={(e) => {
                        updateProduct(prod.id, { description: e.target.value });
                        setActiveSuggestionId(prod.id);
                      }} 
                      onFocus={() => setActiveSuggestionId(prod.id)}
                      className="bg-transparent border-none rounded p-1 w-full focus:ring-1 focus:ring-blue-500 font-bold placeholder:text-gray-700 text-[12px] md:text-[24px] uppercase truncate" 
                    />
                    {activeSuggestionId === prod.id && prod.description.trim().length > 0 && filteredSuggestions.length > 0 && (
                      <div ref={suggestionRef} className="absolute left-0 right-[-100px] top-full mt-1 bg-[#2d2d2d] border-2 border-blue-500 rounded-lg shadow-2xl z-[9999] max-h-[300px] md:max-h-[400px] overflow-y-auto no-scrollbar">
                        {filteredSuggestions.map(item => (
                          <div key={item.id} onClick={() => selectSuggestion(prod.id, item)} className="p-2 md:p-3 hover:bg-blue-600 cursor-pointer flex justify-between items-center border-b border-gray-800 last:border-none">
                            <span className="text-white font-black text-[11px] md:text-[18px] uppercase">{item.name}</span>
                            <span className="text-blue-300 font-mono text-[10px] md:text-[16px] font-black">{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-1 text-right">
                    <input 
                      type="number" 
                      step="0.01" 
                      value={prod.unitPrice} 
                      onChange={(e) => updateProduct(prod.id, { unitPrice: Number(e.target.value) })} 
                      className="bg-gray-800 border-none rounded p-1 w-full text-right focus:ring-1 focus:ring-blue-500 font-black text-[14px] md:text-[22px]" 
                    />
                  </td>
                  <td className="p-1 text-right font-mono text-blue-400 font-black text-[12px] md:text-[20px] truncate">
                    {Math.round(prod.quantity * prod.unitPrice)}
                  </td>
                  <td className="p-1 text-center">
                    <button onClick={() => deleteProduct(prod.id)} className="text-gray-600 hover:text-red-500 p-0.5 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button onClick={handleAddProduct} className="w-full p-3 md:p-4 bg-gray-800/30 hover:bg-gray-800 text-gray-400 flex items-center justify-center gap-2 border-t border-gray-800 font-black text-[16px] md:text-[24px] uppercase transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Adicionar Producto
        </button>
      </div>
    </div>
  );
};

export default TableDetail;
