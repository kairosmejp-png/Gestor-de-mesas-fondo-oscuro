
import React from 'react';
import { Table } from '../types';

interface OpenTablesProps {
  tables: Table[];
  onSelectTable: (id: string) => void;
  onBack: () => void;
}

const OpenTables: React.FC<OpenTablesProps> = ({ tables, onSelectTable, onBack }) => {
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2 
  });

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[36px] font-black text-teal-500 uppercase tracking-wider">Abiertas</h1>
        </div>
      </div>

      <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#2d2d2d] text-gray-400 text-[20px] uppercase">
            <tr>
              <th className="p-5">Mesa</th>
              <th className="p-5 text-center">Productos</th>
              <th className="p-5 text-center">Entregados</th>
              <th className="p-5 text-right">Subtotal</th>
              <th className="p-5 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {tables.map(table => {
              const subtotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
              const deliveredCount = table.products.filter(p => p.delivered).length;
              return (
                <tr key={table.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-[28px] uppercase">{table.name}</span>
                      <span className="text-[14px] text-gray-500 font-bold uppercase">Mesa #{table.number}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center text-white font-black text-[28px]">{table.products.length}</td>
                  <td className="p-5 text-center">
                    <span className={`px-4 py-2 rounded-full text-[18px] font-black ${deliveredCount === table.products.length && table.products.length > 0 ? 'bg-green-600/20 text-green-500' : 'bg-orange-600/20 text-orange-500'}`}>
                      {deliveredCount} / {table.products.length}
                    </span>
                  </td>
                  <td className="p-5 text-right text-blue-400 font-black font-mono text-[30px]">
                    {formatCurrency(subtotal * 1.1)}
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => onSelectTable(table.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-black text-[20px] transition-all uppercase"
                    >
                      ABRIR
                    </button>
                  </td>
                </tr>
              );
            })}
            {tables.length === 0 && (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-600 text-[28px] font-black uppercase tracking-widest">
                  No hay mesas abiertas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpenTables;
