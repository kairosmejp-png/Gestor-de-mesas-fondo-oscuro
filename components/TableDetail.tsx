
import React, { useState, useEffect } from 'react';
import { Table, Product, TablePayments, PaymentRecord } from '../types';

interface TableDetailProps {
  table: Table;
  onBack: () => void;
  onUpdate: (table: Table) => void;
  onDelete: () => void;
}

const TableDetail: React.FC<TableDetailProps> = ({ table, onBack, onUpdate, onDelete }) => {
  const [editingName, setEditingName] = useState(table.name);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  
  const isVentanilla = table.name === 'Ventanilla';

  // Lógica de redondeo automático
  const formatCurrency = (val: number) => Math.round(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  // Cálculos automáticos
  const totalQty = table.products.reduce((acc, p) => acc + p.quantity, 0);
  const productSubtotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  
  const currentServiceFee = isVentanilla ? (totalQty * 0.5) : table.manualServiceFee;
  // IMPORTANTE: En Ventanilla el total NO incluye la taxa
  const currentTotal = isVentanilla ? productSubtotal : table.manualTotal;

  // Sincronizar cálculos si cambian los productos en Ventanilla
  useEffect(() => {
    if (isVentanilla) {
      if (table.manualServiceFee !== currentServiceFee || table.manualTotal !== currentTotal) {
        onUpdate({ 
          ...table, 
          manualServiceFee: currentServiceFee, 
          manualTotal: currentTotal 
        });
      }
    }
  }, [table.products, isVentanilla, currentServiceFee, currentTotal]);

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      quantity: 1,
      description: '', 
      unitPrice: 0,
      delivered: false
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
            {!isVentanilla && <span className="text-gray-500 font-bold text-[25px]">Mesa #{table.number}</span>}
            <input 
              disabled={isVentanilla}
              className={`bg-transparent border-b ${isVentanilla ? 'border-transparent' : 'border-transparent hover:border-gray-700 focus:border-blue-500'} focus:outline-none font-bold text-[29px] text-white px-1`}
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => onUpdate({ ...table, name: editingName })}
              style={{ fontSize: '29px' }}
            />
          </div>
        </div>
        {!isVentanilla && (
          <button onClick={() => confirm('¿Eliminar esta mesa?') && onDelete()} className="text-red-500 hover:text-red-400 flex items-center gap-1 text-[19px] font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            ELIMINAR MESA
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          
          {/* SECCIÓN PAGOS VENTANILLA (Fila superior) */}
          {isVentanilla && (
            <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 space-y-4">
              <div className="flex items-center gap-4">
                <input 
                  type="number"
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

          {/* TABLA DE PRODUCTOS */}
          <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
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
                {table.products.map(prod => (
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
                      <input type="number" value={prod.quantity} onChange={(e) => updateProduct(prod.id, { quantity: Number(e.target.value) })} className="bg-gray-800 border-none rounded p-2 w-32 text-center focus:ring-1 focus:ring-blue-500 font-bold" style={{ fontSize: '40px' }} />
                    </td>
                    <td className="p-4">
                      <input type="text" placeholder="Escriba aquí..." value={prod.description} onChange={(e) => updateProduct(prod.id, { description: e.target.value })} className="bg-transparent border-none rounded p-2 w-full focus:ring-1 focus:ring-blue-500 font-bold placeholder:text-gray-700" style={{ fontSize: '40px' }} />
                    </td>
                    <td className="p-4 text-right">
                      <input type="number" value={prod.unitPrice} onChange={(e) => updateProduct(prod.id, { unitPrice: Number(e.target.value) })} className="bg-gray-800 border-none rounded p-2 w-48 text-right focus:ring-1 focus:ring-blue-500 font-bold" style={{ fontSize: '40px' }} />
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
                ))}
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
            
            {!isVentanilla && (
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
              <span className="text-gray-300">{isVentanilla ? 'Taxa:' : 'Taxa manual:'}</span>
              <input 
                disabled={isVentanilla}
                type="number"
                className="bg-gray-800 border border-gray-700 rounded p-1 w-36 text-right text-blue-300 font-mono"
                value={table.manualServiceFee}
                onChange={(e) => !isVentanilla && onUpdate({ ...table, manualServiceFee: Number(e.target.value) })}
                style={{ fontSize: '26px' }}
              />
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-white font-bold text-[23px]">TOTAL:</span>
              <input 
                disabled={isVentanilla}
                type="number"
                className="bg-gray-800 border border-blue-900 rounded p-2 w-44 text-right text-green-400 font-bold font-mono text-[29px]"
                value={table.manualTotal}
                onChange={(e) => !isVentanilla && onUpdate({ ...table, manualTotal: Number(e.target.value) })}
                style={{ fontSize: '29px' }}
              />
            </div>
          </div>

          {/* PAGOS */}
          <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 space-y-4">
            <h3 className="text-[17px] uppercase font-bold text-gray-500 tracking-wider">Medios de Pago</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-32 bg-green-600 text-white text-[15px] font-bold py-2 px-3 rounded text-center">EFECTIVO</div>
                <input type="number" disabled={isVentanilla} className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono" value={table.payments.cash} onChange={(e) => !isVentanilla && updatePaymentsDirectly({ cash: Number(e.target.value) })} style={{ fontSize: '21px' }} />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-yellow-500 text-black text-[15px] font-bold py-2 px-3 rounded text-center uppercase">Pix</div>
                <input type="number" disabled={isVentanilla} className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono" value={table.payments.pix} onChange={(e) => !isVentanilla && updatePaymentsDirectly({ pix: Number(e.target.value) })} style={{ fontSize: '21px' }} />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-sky-500 text-white text-[15px] font-bold py-2 px-3 rounded text-center">DÉBITO</div>
                <input type="number" disabled={isVentanilla} className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono" value={table.payments.debit} onChange={(e) => !isVentanilla && updatePaymentsDirectly({ debit: Number(e.target.value) })} style={{ fontSize: '21px' }} />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-purple-500 text-white text-[15px] font-bold py-2 px-3 rounded text-center">CRÉDITO</div>
                <input type="number" disabled={isVentanilla} className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono" value={table.payments.credit} onChange={(e) => !isVentanilla && updatePaymentsDirectly({ credit: Number(e.target.value) })} style={{ fontSize: '21px' }} />
              </div>
            </div>
          </div>

          {/* DIVIDIR CUENTA (Solo si NO es ventanilla) */}
          {!isVentanilla && (
            <div className="bg-[#1e293b] p-4 rounded-lg border border-blue-900/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-200 font-semibold flex items-center gap-2 text-[21px]">Dividir</span>
                <input type="number" min="1" className="bg-slate-800 border-none rounded p-2 w-24 text-center font-bold text-white" value={table.splitCount} onChange={(e) => onUpdate({ ...table, splitCount: Math.max(1, Number(e.target.value)) })} style={{ fontSize: '21px' }} />
              </div>
              <div className="flex justify-between items-center text-[19px]">
                <span className="text-gray-400">Por persona:</span>
                <span className="text-blue-300 font-bold font-mono text-[23px]">{formatCurrency(table.manualTotal / table.splitCount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableDetail;
