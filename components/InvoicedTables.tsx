
import React from 'react';
import { Table } from '../types';

interface InvoicedTablesProps {
  tables: Table[];
  onSelectTable: (id: string) => void;
  onBack: () => void;
}

const InvoicedTables: React.FC<InvoicedTablesProps> = ({ tables, onSelectTable, onBack }) => {
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
          <h1 className="text-[36px] font-black text-indigo-500 uppercase tracking-wider">Facturadas</h1>
        </div>
      </div>

      <div className="space-y-6">
        {tables.map(table => {
          const totalPaid = table.payments.cash + table.payments.pix + table.payments.debit + table.payments.credit;
          
          return (
            <div 
              key={table.id}
              onClick={() => onSelectTable(table.id)}
              className="bg-[#242424] hover:bg-[#2d2d2d] border border-gray-800 rounded-2xl p-6 flex flex-wrap lg:flex-nowrap items-center justify-between cursor-pointer transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl gap-4"
            >
              {/* Bloques de Pago de gran tamaño */}
              <div className="flex flex-wrap items-center gap-4">
                <div className={`w-48 h-24 flex flex-col items-center justify-center rounded-xl transition-all ${table.payments.cash > 0 ? 'bg-green-600 shadow-lg shadow-green-900/20' : 'bg-gray-800 opacity-10'}`}>
                  <span className="text-[12px] font-black uppercase tracking-widest mb-1">Efectivo</span>
                  <span className="text-[32px] font-black font-mono leading-none">{table.payments.cash > 0 ? formatCurrency(table.payments.cash).split(',')[0] : '-'}</span>
                </div>
                <div className={`w-48 h-24 flex flex-col items-center justify-center rounded-xl transition-all ${table.payments.pix > 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'bg-gray-800 opacity-10'}`}>
                  <span className="text-[12px] font-black uppercase tracking-widest mb-1">Pix</span>
                  <span className="text-[32px] font-black font-mono leading-none">{table.payments.pix > 0 ? formatCurrency(table.payments.pix).split(',')[0] : '-'}</span>
                </div>
                <div className={`w-48 h-24 flex flex-col items-center justify-center rounded-xl transition-all ${table.payments.debit > 0 ? 'bg-sky-500 shadow-lg shadow-sky-900/20' : 'bg-gray-800 opacity-10'}`}>
                  <span className="text-[12px] font-black uppercase tracking-widest mb-1">Débito</span>
                  <span className="text-[32px] font-black font-mono leading-none">{table.payments.debit > 0 ? formatCurrency(table.payments.debit).split(',')[0] : '-'}</span>
                </div>
                <div className={`w-48 h-24 flex flex-col items-center justify-center rounded-xl transition-all ${table.payments.credit > 0 ? 'bg-purple-600 shadow-lg shadow-purple-900/20' : 'bg-gray-800 opacity-10'}`}>
                  <span className="text-[12px] font-black uppercase tracking-widest mb-1">Crédito</span>
                  <span className="text-[32px] font-black font-mono leading-none">{table.payments.credit > 0 ? formatCurrency(table.payments.credit).split(',')[0] : '-'}</span>
                </div>
                
                {/* Bloque de Taxa Manual */}
                <div className={`w-48 h-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${table.manualServiceFee > 0 ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 opacity-20'}`}>
                  <span className="text-[12px] font-black uppercase tracking-widest text-blue-400 mb-1">Taxa Manual</span>
                  <span className="text-[32px] font-black font-mono leading-none text-blue-400">
                    {table.manualServiceFee > 0 ? formatCurrency(table.manualServiceFee).split(',')[0] : '-'}
                  </span>
                </div>
              </div>

              {/* Información y Total */}
              <div className="flex items-center gap-10 ml-auto">
                <div className="text-right">
                  <span className="text-white font-black text-[42px] uppercase leading-none block tracking-tighter">{table.name}</span>
                  <span className="text-[16px] text-gray-500 font-bold uppercase tracking-widest">Mesa #{table.number}</span>
                </div>
                <div className="bg-indigo-600/10 border-2 border-indigo-600/30 px-10 py-4 rounded-2xl text-right min-w-[280px]">
                  <span className="text-indigo-500 text-[14px] block uppercase font-black mb-1 tracking-widest">Total Cobrado</span>
                  <span className="text-indigo-400 font-black font-mono text-[48px] leading-none">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {tables.length === 0 && (
          <div className="p-32 text-center bg-[#242424] rounded-2xl border border-gray-800 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-700 mx-auto mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-[32px] font-black uppercase tracking-widest">Sin historial de cobros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicedTables;
