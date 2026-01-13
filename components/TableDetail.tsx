
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
  const totalQty = table.products.reduce((acc, p) => acc + p.quantity, 0);
  const totalPayments = (Object.values(table.payments) as number[]).reduce((a, b) => a + b, 0);
  
  // Lógica Visual de Sugerido
  const suggestedTaxa = isBalcao ? (totalQty * 0.25) : (productSubtotal * 0.10);
  const suggestedTotalValue = productSubtotal + suggestedTaxa;

  // Lógica Contable de Taxa (Lo que se guarda en la mesa)
  const actualExcedente = isBalcao 
    ? (totalQty * 0.25) 
    : Math.max(0, totalPayments - productSubtotal);

  useEffect(() => {
    // Sincronizar la manualServiceFee según las reglas de negocio
    if (Math.abs(table.manualServiceFee - actualExcedente) > 0.01) {
      onUpdate({ ...table, manualServiceFee: actualExcedente });
    }
  }, [totalPayments, productSubtotal, totalQty, isBalcao, actualExcedente]);

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

  const updatePaymentsDirectly = (changes: Partial<TablePayments>) => {
    onUpdate({ ...table, payments: { ...table.payments, ...changes } });
  };

  const methodColors: Record<string, string> = {
    cash: 'bg-green-600',
    pix: 'bg-yellow-500',
    debit: 'bg-sky-500',
    credit: 'bg-purple-500'
  };

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-3 md:p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4 md:mb-6">
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
              className={`bg-transparent border-b ${isBalcao ? 'border-transparent' : 'border-transparent hover:border-gray-700 focus:border-blue-500'} focus:outline-none font-bold text-[16px] md:text-[29px] text-white px-1 uppercase w-24 md:w-auto`}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        <div className="lg:col-span-3 space-y-4">
          {isBalcao && (
            <div className="bg-[#242424] p-2 md:p-4 rounded-lg border border-gray-800 space-y-2 md:space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Monto..."
                  className="bg-gray-800 border-2 border-gray-700 rounded-lg p-2 md:p-3 w-full md:w-48 text-[18px] md:text-[24px] font-bold text-white focus:border-blue-500 focus:outline-none"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
                  <button onClick={() => addPayment('cash')} className="bg-green-600 hover:bg-green-700 p-2 md:p-3 rounded font-bold text-[12px] md:text-[18px]">EFECTIVO</button>
                  <button onClick={() => addPayment('pix')} className="bg-yellow-500 hover:bg-yellow-600 p-2 md:p-3 rounded font-bold text-[12px] md:text-[18px] text-black">PIX</button>
                  <button onClick={() => addPayment('debit')} className="bg-sky-500 hover:bg-sky-600 p-2 md:p-3 rounded font-bold text-[12px] md:text-[18px]">DÉBITO</button>
                  <button onClick={() => addPayment('credit')} className="bg-purple-500 hover:bg-purple-600 p-2 md:p-3 rounded font-bold text-[12px] md:text-[18px]">CRÉDITO</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {table.paymentRecords?.map(record => (
                  <div key={record.id} className={`${methodColors[record.method]} p-1.5 md:p-3 rounded-lg flex items-center gap-1.5 md:gap-3 shadow-lg`}>
                    <div className="flex flex-col">
                      <span className="text-[7px] md:text-[10px] uppercase font-black opacity-70">{record.method === 'cash' ? 'Efectivo' : record.method.toUpperCase()}</span>
                      <span className="text-[12px] md:text-[20px] font-black">{formatCurrency(record.amount)}</span>
                    </div>
                    <button onClick={() => removePayment(record.id)} className="bg-black/20 hover:bg-black/40 rounded-full p-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden relative w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-[#2d2d2d] text-gray-400 text-[9px] md:text-[17px] uppercase">
                <tr>
                  <th className="p-1 md:p-2 w-[10%] md:w-16 text-center">OK</th>
                  <th className="p-1 md:p-2 w-[15%] md:w-24 text-center">Cant.</th>
                  <th className="p-1 md:p-2 w-[35%]">Item</th>
                  <th className="p-1 md:p-2 w-[15%] text-right">Unit.</th>
                  <th className="p-1 md:p-2 w-[15%] text-right">Total</th>
                  <th className="p-1 md:p-2 w-[10%] md:w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {table.products.map(prod => {
                  const filteredSuggestions = menu.filter(item => 
                    item.name.toLowerCase().includes(prod.description.toLowerCase())
                  );

                  return (
                    <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-1 md:p-2">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => updateProduct(prod.id, { delivered: !prod.delivered })}
                            className={`w-5 h-5 md:w-10 md:h-10 rounded flex items-center justify-center transition-colors ${prod.delivered ? 'bg-green-600' : 'bg-red-600'}`}
                          >
                            {prod.delivered && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-6 md:w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                          </button>
                        </div>
                      </td>
                      <td className="p-1 md:p-2">
                        <input type="number" step="1" value={prod.quantity} onChange={(e) => updateProduct(prod.id, { quantity: Number(e.target.value) })} className="bg-gray-800 border-none rounded p-1 w-full text-center focus:ring-1 focus:ring-blue-500 font-bold text-[12px] md:text-[32px]" />
                      </td>
                      <td className="p-1 md:p-2 relative">
                        <input 
                          type="text" 
                          placeholder="..." 
                          value={prod.description} 
                          onChange={(e) => {
                            updateProduct(prod.id, { description: e.target.value });
                            setActiveSuggestionId(prod.id);
                          }} 
                          onFocus={() => setActiveSuggestionId(prod.id)}
                          className="bg-transparent border-none rounded p-1 w-full focus:ring-1 focus:ring-blue-500 font-bold placeholder:text-gray-700 text-[11px] md:text-[32px] uppercase truncate" 
                        />
                        {activeSuggestionId === prod.id && prod.description.trim().length > 0 && filteredSuggestions.length > 0 && (
                          <div ref={suggestionRef} className="absolute left-0 right-[-120px] top-full mt-1 bg-[#2d2d2d] border-2 border-blue-500 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[9999] max-h-[180px] md:max-h-[400px] overflow-y-auto no-scrollbar">
                            {filteredSuggestions.map(item => (
                              <div key={item.id} onClick={() => selectSuggestion(prod.id, item)} className="p-1.5 md:p-4 hover:bg-blue-600 cursor-pointer flex justify-between items-center border-b border-gray-800 last:border-none">
                                <span className="text-white font-black text-[11px] md:text-[24px] uppercase">{item.name}</span>
                                <span className="text-blue-300 font-mono text-[10px] md:text-[20px] font-black">{formatCurrency(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-1 md:p-2 text-right">
                        <input type="number" step="0.01" value={prod.unitPrice} onChange={(e) => updateProduct(prod.id, { unitPrice: Number(e.target.value) })} className="bg-gray-800 border-none rounded p-1 w-full text-right focus:ring-1 focus:ring-blue-500 font-bold text-[11px] md:text-[32px]" />
                      </td>
                      <td className="p-1 md:p-2 text-right font-mono text-blue-400 font-black text-[11px] md:text-[32px] truncate">
                        {Math.round(prod.quantity * prod.unitPrice)}
                      </td>
                      <td className="p-1 md:p-2 text-center">
                        <button onClick={() => deleteProduct(prod.id)} className="text-gray-600 hover:text-red-500 p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button onClick={handleAddProduct} className="w-full p-4 md:p-8 bg-gray-800/30 hover:bg-gray-800 text-gray-400 flex items-center justify-center gap-2 md:gap-3 border-t border-gray-800 font-black text-[16px] md:text-[32px] uppercase">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Adicionar Producto
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:gap-6 lg:col-span-1">
          <div className="bg-[#242424] p-3 md:p-4 rounded-lg border border-gray-800 flex flex-col gap-2 md:gap-4">
            <div className="flex justify-between items-center text-[14px] md:text-[28px]"><span className="text-gray-500">Subtotal:</span><span className="font-mono font-bold text-white">{formatCurrency(productSubtotal)}</span></div>
            <div className="flex justify-between items-center text-[14px] md:text-[21px]">
              <span className="text-gray-500">Taxa:</span>
              <span className={`font-bold font-mono ${isBalcao ? 'text-green-400' : 'text-gray-400'}`}>{formatCurrency(suggestedTaxa)}</span>
            </div>
            <div className="flex justify-between items-center text-[15px] md:text-[24px] text-blue-400 font-bold border-t border-gray-700 mt-1 pt-2">
                <span>Precio Sugerido:</span>
                <span className="font-mono">{formatCurrency(suggestedTotalValue)}</span>
            </div>
            <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-700">
                <span className="text-white font-black text-[16px] md:text-[23px]">TOTAL:</span>
                <span className="text-green-400 font-bold font-mono text-[20px] md:text-[32px]">{formatCurrency(productSubtotal + table.manualServiceFee)}</span>
            </div>
          </div>

          <div className="bg-[#242424] p-3 md:p-4 rounded-lg border border-gray-800 space-y-2 md:space-y-4">
            <h3 className="text-[10px] md:text-[17px] uppercase font-bold text-gray-500">Pagos</h3>
            <div className="grid grid-cols-1 gap-1.5 md:gap-4">
              {['cash', 'pix', 'debit', 'credit'].map(m => (
                <div key={m} className="flex items-center gap-2">
                  <div className={`w-14 md:w-28 ${methodColors[m]} text-white text-[8px] md:text-[15px] font-bold py-1 rounded text-center shrink-0 uppercase`}>{m === 'cash' ? 'Efe' : m}</div>
                  <input type="number" step="0.01" className="bg-gray-800 border-none rounded px-2 py-0.5 flex-1 text-right font-mono text-[16px] md:text-[31px] min-w-0" value={(table.payments as any)[m]} onChange={(e) => updatePaymentsDirectly({ [m]: Number(e.target.value) })} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetail;
