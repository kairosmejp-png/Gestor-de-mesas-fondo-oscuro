
import React, { useState } from 'react';
import { Table, Product, TablePayments } from '../types';

interface TableDetailProps {
  table: Table;
  onBack: () => void;
  onUpdate: (table: Table) => void;
  onDelete: () => void;
}

const TableDetail: React.FC<TableDetailProps> = ({ table, onBack, onUpdate, onDelete }) => {
  const [editingName, setEditingName] = useState(table.name);

  const subtotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const suggestedFee = subtotal * 0.1;
  const suggestedTotal = subtotal + suggestedFee;
  const perPerson = table.splitCount > 0 ? table.manualTotal / table.splitCount : 0;

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      quantity: 1,
      description: 'Nuevo Producto',
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

  const updatePayments = (changes: Partial<TablePayments>) => {
    onUpdate({ ...table, payments: { ...table.payments, ...changes } });
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="max-w-6xl mx-auto bg-[#1a1a1a] rounded-xl shadow-2xl p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-bold text-xl">Mesa #{table.number}</span>
            <input 
              className="bg-transparent border-b border-transparent hover:border-gray-700 focus:border-blue-500 focus:outline-none font-bold text-2xl text-white px-1"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => onUpdate({ ...table, name: editingName })}
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>
        <button 
          onClick={() => {
            if (confirm('¿Eliminar esta mesa?')) onDelete();
          }}
          className="text-red-500 hover:text-red-400 flex items-center gap-1 text-sm font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          ELIMINAR MESA
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Product Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full text-left border-collapse" style={{ fontSize: '16px' }}>
              <thead className="bg-[#2d2d2d] text-gray-400 text-xs uppercase">
                <tr>
                  <th className="p-3 w-12">Entrega</th>
                  <th className="p-3 w-20 text-center">Cant.</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3 w-32 text-right">Unit.</th>
                  <th className="p-3 w-32 text-right">Total</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {table.products.map(prod => (
                  <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-2">
                      <button 
                        onClick={() => updateProduct(prod.id, { delivered: !prod.delivered })}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${prod.delivered ? 'bg-green-600' : 'bg-red-600'}`}
                      >
                        {prod.delivered ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : null}
                      </button>
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        value={prod.quantity} 
                        onChange={(e) => updateProduct(prod.id, { quantity: Number(e.target.value) })}
                        className="bg-gray-800 border-none rounded p-1 w-16 text-center focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="text" 
                        value={prod.description} 
                        onChange={(e) => updateProduct(prod.id, { description: e.target.value })}
                        className="bg-transparent border-none rounded p-1 w-full focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <input 
                        type="number" 
                        value={prod.unitPrice} 
                        onChange={(e) => updateProduct(prod.id, { unitPrice: Number(e.target.value) })}
                        className="bg-gray-800 border-none rounded p-1 w-24 text-right focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-2 text-right font-mono text-blue-400">
                      {formatCurrency(prod.quantity * prod.unitPrice)}
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => deleteProduct(prod.id)} className="text-gray-600 hover:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              onClick={handleAddProduct}
              className="w-full p-4 bg-gray-800/30 hover:bg-gray-800 text-gray-400 flex items-center justify-center gap-2 transition-colors border-t border-gray-800 font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar producto
            </button>
          </div>
        </div>

        {/* RIGHT: Totals and Payments */}
        <div className="flex flex-col gap-6" style={{ fontSize: '16px' }}>
          <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Taxa sugerida (10%):</span>
              <span className="font-mono">{formatCurrency(suggestedFee)}</span>
            </div>
            <div className="flex justify-between items-center text-blue-400 font-bold border-b border-gray-700 pb-2 mb-2">
              <span>Total sugerido:</span>
              <span className="font-mono">{formatCurrency(suggestedTotal)}</span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-300">Taxa manual:</span>
              <input 
                type="number"
                className="bg-gray-800 border border-gray-700 rounded p-1 w-32 text-right text-blue-300 font-mono"
                value={table.manualServiceFee}
                onChange={(e) => onUpdate({ ...table, manualServiceFee: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-white font-bold text-lg">TOTAL FINAL:</span>
              <input 
                type="number"
                className="bg-gray-800 border border-blue-900 rounded p-2 w-32 text-right text-green-400 font-bold font-mono text-xl"
                value={table.manualTotal}
                onChange={(e) => onUpdate({ ...table, manualTotal: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="bg-[#242424] p-4 rounded-lg border border-gray-800 space-y-4">
            <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Medios de Pago</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-24 bg-green-600 text-white text-xs font-bold py-2 px-3 rounded text-center">EFECTIVO</div>
                <input 
                  type="number"
                  className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono"
                  value={table.payments.cash}
                  onChange={(e) => updatePayments({ cash: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-yellow-500 text-black text-xs font-bold py-2 px-3 rounded text-center uppercase">Pix</div>
                <input 
                  type="number"
                  className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono"
                  value={table.payments.pix}
                  onChange={(e) => updatePayments({ pix: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-orange-500 text-white text-xs font-bold py-2 px-3 rounded text-center">DÉBITO</div>
                <input 
                  type="number"
                  className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono"
                  value={table.payments.debit}
                  onChange={(e) => updatePayments({ debit: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-red-600 text-white text-xs font-bold py-2 px-3 rounded text-center">CRÉDITO</div>
                <input 
                  type="number"
                  className="bg-gray-800 border-none rounded p-2 flex-1 text-right font-mono"
                  value={table.payments.credit}
                  onChange={(e) => updatePayments({ credit: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b] p-4 rounded-lg border border-blue-900/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Dividir Cuenta
              </span>
              <input 
                type="number"
                min="1"
                className="bg-slate-800 border-none rounded p-2 w-20 text-center font-bold text-white"
                value={table.splitCount}
                onChange={(e) => onUpdate({ ...table, splitCount: Math.max(1, Number(e.target.value)) })}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Pago por persona:</span>
              <span className="text-blue-300 font-bold font-mono text-lg">{formatCurrency(perPerson)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDetail;
