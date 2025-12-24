
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

  // Mostrar siempre 2 decimales en el detalle de la mesa
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  // Cálculos automáticos
  const totalQty = table.products.reduce((acc, p) => acc + p.quantity, 0);
  const productSubtotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  
  // Taxa balcao ajustada a 0.25 por unidad
  const currentServiceFee = isBalcao ? (totalQty * 0.25) : table.manualServiceFee;
  const currentTotal = isBalcao ? productSubtotal : table.manualTotal;

  // Sincronizar cálculos si cambian los productos en BALCAO
  useEffect(() => {
    if (isBalcao) {
      if (table.manualServiceFee !== currentServiceFee || table.manualTotal !== currentTotal) {
        onUpdate({ 
          ...table, 
          manualServiceFee: currentServiceFee, 
          manualTotal: currentTotal 
        });
      }
    }
  }, [table.products, isBalcao, currentServiceFee, currentTotal]);

  // Click outside suggestions
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
      createdAt: Date.now() // Registro de tiempo de creación
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
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-6 border border-gray-800 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {!isBalcao && <span className="text-gray-500 font-bold text-[25px]">Mesa #{table.number}</span>}
            <input 
              disabled={isBalcao}
              className={`bg-transparent border-b ${isBalcao ? 'border-transparent' : 'border-transparent hover:border-gray-700 focus:border-blue-500'} focus:outline-none font-bold text-[29px] text-white px-1 uppercase`}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => onUpdate({ ...table, name: editingName })}
              style={{ fontSize: '29px' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          
          {/* SECCIÓN PAGOS BALCAO (Fila superior) */}
          {isBalcao && (
            <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 space-y-4">
              <div className="flex items-center gap-4">
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Monto pago..."
                  className="bg-gray-800 border-2 border-gray-700 rounded-lg p-3 w-48 text-[24px] font-bold text-white focus:border-blue-500 focus:outline-none"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <button onClick={() => addPayment('cash')} className="bg-green-600 hover:bg-green-700 p-3 rounded font-bold text-[18px]">EFECTIVO</button>
                  <button onClick={() => addPayment('pix')} className="bg-yellow-500 hover:bg-yellow-600 p-3 rounded font-bold text-[18px] text-black">PIX</button>
                  <button onClick={() => addPayment('debit')} className="bg-sky-500 hover:bg-sky-600 p-3 rounded font-bold text-[18px]">DÉBITO</button>
                  <button onClick={() => addPayment('credit')} className="bg-purple-500 hover:bg-purple-600 p-3 rounded font-bold text-[18px]">CRÉDITO</button>
                </div>
              </div>

              {/* CUADRADOS DE PAGOS */}
              <div className="flex flex-wrap gap-2">
                {table.paymentRecords?.map(record => (
                  <div key={record.id} className={`${methodColors[record.method]} p-3 rounded-lg flex items-center gap-3 shadow-lg animate-in zoom-in duration-200`}>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black opacity-70">{record.method === 'cash' ? 'Efectivo' : record.method.toUpperCase()}</span>
                      <span className="text-[20px] font-black">{formatCurrency(record.amount)}</span>
                    </div>
                    <button onClick={() => removePayment(record.id)} className="bg-black/20 hover:bg-black/40 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABLA DE PRODUCTOS - Nota: se cambió overflow-hidden por overflow-visible para permitir que el autocompletado flote */}
          <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-visible relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#2d2d2d] text-gray-400 text-[19px] uppercase">
                <tr>
                  <th className="p-4 w-20">Entrega</th>
                  <th className="p-4 w-32 text-center">Cant.</th>
                  <th className="p-4 min-w-[450px]">Descripción</th>
                  <th className="p-4 w-52 text-right">Unit.</th>
                  <th className="p-4 w-56 text-right">Total</th>
                  <th className="p-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {table.products.map(prod => {
                  const filteredSuggestions = menu.filter(item => 
                    item.name.toLowerCase().includes(prod.description.toLowerCase())
                  );

                  return (
                    <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <button 
                          onClick={() => updateProduct(prod.id, { delivered: !prod.delivered })}
                          className={`w-12 h-12 rounded flex items-center justify-center transition-colors ${prod.delivered ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                          {prod.delivered && <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </button>
                      </td>
                      <td className="p-4">
                        <input type="number" step="1" value={prod.quantity} onChange={(e) => updateProduct(prod.id, { quantity: Number(e.target.value) })} className="bg-gray-800 border-none rounded p-2 w-32 text-center focus:ring-1 focus:ring-blue-500 font-bold" style={{ fontSize: '40px' }} />
                      </td>
                      <td className="p-4 relative">
                        <input 
                          type="text" 
                          placeholder="Escriba aquí..." 
                          value={prod.description} 
                          onChange={(e) => {
                            updateProduct(prod.id, { description: e.target.value });
                            setActiveSuggestionId(prod.id);
                          }} 
                          onFocus={() => setActiveSuggestionId(prod.id)}
                          className="bg-transparent border-none rounded p-2 w-full focus:ring-1 focus:ring-blue-500 font-bold placeholder:text-gray-700" 
                          style={{ fontSize: '40px' }} 
                        />
                        {/* AUTOCOMPLETE SUGGESTIONS - Flota sobre el resto de la interfaz */}
                        {activeSuggestionId === prod.id && prod.description.trim().length > 0 && filteredSuggestions.length > 0 && (
                          <div 
                            ref={suggestionRef} 
                            className="absolute left-0 right-[-100px] top-full mt-1 bg-[#2d2d2d] border-2 border-blue-500 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[9999] max-h-[400px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-150"
                          >
                            {filteredSuggestions.map(item => (
                              <div 
                                key={item.id}
                                onClick={() => selectSuggestion(prod.id, item)}
                                className="p-5 hover:bg-blue-600 cursor-pointer flex justify-between items-center border-b border-gray-800 last:border-none group transition-colors"
                              >
                                <span className="text-white font-black text-[28px] group-hover:scale-105 transition-transform origin-left uppercase">{item.name}</span>
                                <span className="text-blue-300 font-mono text-[24px] font-black group-hover:text-white">{formatCurrency(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <input type="number" step="0.01" value={prod.unitPrice} onChange={(e) => updateProduct(prod.id, { unitPrice: Number(e.target.value) })} className="bg-gray-800 border-none rounded p-2 w-48 text-right focus:ring-1 focus:ring-blue-500 font-bold" style={{ fontSize: '40px' }} />
                      </td>
                      <td className="p-4 text-right font-mono text-blue-400 font-black" style={{ fontSize: '40px' }}>
                        {formatCurrency(prod.quantity * prod.unitPrice)}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => deleteProduct(prod.id)} className="text-gray-600 hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button onClick={handleAddProduct} className="w-full p-8 bg-gray-800/30 hover:bg-gray-800 text-gray-400 flex items-center justify-center gap-3 transition-colors border-t border-gray-800 font-black text-[32px]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Adicionar producto
            </button>
          </div>
        </div>

        {/* SIDEBAR TOTALS */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 flex flex-col gap-4">
            
            {!isBalcao && (
              <>
                <div className="flex justify-between items-center text-[28px]">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-mono font-bold">{formatCurrency(productSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[28px]">
                  <span className="text-gray-500">Taxa (10%):</span>
                  <span className="font-mono font-bold">{formatCurrency(productSubtotal * 0.1)}</span>
                </div>
                <div className="flex justify-between items-center text-blue-400 font-bold border-b-2 border-gray-700 pb-3 mb-2 text-[30px]">
                  <span>Sugerido:</span>
                  <span className="font-mono">{formatCurrency(productSubtotal * 1.1)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center gap-4 text-[21px]">
              <span className="text-gray-300">{isBalcao ? 'Taxa:' : 'Taxa manual:'}</span>
              <input 
                disabled={isBalcao}
                type="number"
                step="0.01"
                className="bg-gray-800 border border-gray-700 rounded p-1 w-36 text-right text-blue-300 font-mono"
                value={table.manualServiceFee}
                onChange={(e) => !isBalcao && onUpdate({ ...table, manualServiceFee: Number(e.target.value) })}
                style={{ fontSize: '26px' }}
              />
            </div>

            {/* Casilla de TOTAL solo para BALCAO */}
            {isBalcao && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-white font-bold text-[23px]">TOTAL:</span>
                <input 
                  disabled={true}
                  type="number"
                  step="0.01"
                  className="bg-gray-800 border border-blue-900 rounded p-2 w-44 text-right text-green-400 font-bold font-mono text-[29px]"
                  value={table.manualTotal}
                  style={{ fontSize: '29px' }}
                />
              </div>
            )}
          </div>

          {/* PAGOS */}
          <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 space-y-4 overflow-hidden">
            <h3 className="text-[17px] uppercase font-bold text-gray-500 tracking-wider">Medios de Pago</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-28 bg-green-600 text-white text-[15px] font-bold py-2 px-1 rounded text-center shrink-0">EFECTIVO</div>
                <input 
                  type="number" 
                  step="0.01"
                  disabled={isBalcao} 
                  className="bg-gray-800 border-none rounded px-2 py-1 flex-1 text-right font-mono focus:ring-1 focus:ring-green-500 min-w-0" 
                  value={table.payments.cash} 
                  onChange={(e) => !isBalcao && updatePaymentsDirectly({ cash: Number(e.target.value) })} 
                  style={{ fontSize: isBalcao ? '21px' : '31px' }} 
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 bg-yellow-500 text-black text-[15px] font-bold py-2 px-1 rounded text-center uppercase shrink-0">Pix</div>
                <input 
                  type="number" 
                  step="0.01"
                  disabled={isBalcao} 
                  className="bg-gray-800 border-none rounded px-2 py-1 flex-1 text-right font-mono focus:ring-1 focus:ring-yellow-500 min-w-0" 
                  value={table.payments.pix} 
                  onChange={(e) => !isBalcao && updatePaymentsDirectly({ pix: Number(e.target.value) })} 
                  style={{ fontSize: isBalcao ? '21px' : '31px' }} 
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 bg-sky-500 text-white text-[15px] font-bold py-2 px-1 rounded text-center shrink-0">DÉBITO</div>
                <input 
                  type="number" 
                  step="0.01"
                  disabled={isBalcao} 
                  className="bg-gray-800 border-none rounded px-2 py-1 flex-1 text-right font-mono focus:ring-1 focus:ring-sky-500 min-w-0" 
                  value={table.payments.debit} 
                  onChange={(e) => !isBalcao && updatePaymentsDirectly({ debit: Number(e.target.value) })} 
                  style={{ fontSize: isBalcao ? '21px' : '31px' }} 
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 bg-purple-500 text-white text-[15px] font-bold py-2 px-1 rounded text-center shrink-0">CRÉDITO</div>
                <input 
                  type="number" 
                  step="0.01"
                  disabled={isBalcao} 
                  className="bg-gray-800 border-none rounded px-2 py-1 flex-1 text-right font-mono focus:ring-1 focus:ring-purple-500 min-w-0" 
                  value={table.payments.credit} 
                  onChange={(e) => !isBalcao && updatePaymentsDirectly({ credit: Number(e.target.value) })} 
                  style={{ fontSize: isBalcao ? '21px' : '31px' }} 
                />
              </div>
            </div>
          </div>

          {/* DIVIDIR CUENTA (Solo si NO es BALCAO) */}
          {!isBalcao && (
            <div className="bg-[#1e293b] p-4 rounded-lg border border-blue-900/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-200 font-semibold flex items-center gap-2 text-[21px]">Dividir</span>
                <input type="number" min="1" className="bg-slate-800 border-none rounded p-2 w-24 text-center font-bold text-white" value={table.splitCount} onChange={(e) => onUpdate({ ...table, splitCount: Math.max(1, Number(e.target.value)) })} style={{ fontSize: '21px' }} />
              </div>
              <div className="flex justify-between items-center text-[19px]">
                <span className="text-gray-400">Por persona:</span>
                <span className="text-blue-300 font-bold font-mono text-[23px]">{formatCurrency(((Object.values(table.payments) as number[]).reduce((a,b)=>a+b, 0)) / table.splitCount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDetail;
