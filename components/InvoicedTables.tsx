
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
    minimumFractionDigits: 0 
  });

  const formatExact = (val: number) => val.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2 
  });

  const methodColors: Record<string, string> = {
    cash: 'bg-green-600',
    pix: 'bg-yellow-500',
    debit: 'bg-sky-500',
    credit: 'bg-purple-600'
  };

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-3 md:p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[22px] md:text-[36px] font-black text-indigo-500 uppercase tracking-wider">Facturadas</h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        {tables.map(table => {
          const totalPaid = table.payments.cash + table.payments.pix + table.payments.debit + table.payments.credit;
          
          return (
            <div 
              key={table.id}
              onClick={() => onSelectTable(table.id)}
              className="bg-[#242424] hover:bg-[#2d2d2d] border border-gray-800 rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between cursor-pointer transition-all gap-4"
            >
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-black text-[18px] md:text-[32px] uppercase truncate leading-none">{table.name}</span>
                  <span className="text-[10px] md:text-[14px] text-gray-500 font-bold uppercase">Mesa #{table.number}</span>
                </div>
                
                {/* Indicadores de pago con monto exacto */}
                <div className="flex flex-wrap gap-2">
                  {/* // Cast amount to number to fix operator '>' cannot be applied to types 'unknown' and 'number' */}
                  {Object.entries(table.payments).map(([method, amount]) => (amount as number) > 0 && (
                    <div key={method} className={`${methodColors[method]} ${method === 'pix' ? 'text-black' : 'text-white'} px-2 py-1 rounded-lg flex flex-col items-center min-w-[60px] md:min-w-[80px]`}>
                      <span className="text-[6px] md:text-[9px] font-black uppercase opacity-70">{method === 'cash' ? 'Efectivo' : method}</span>
                      <span className="text-[10px] md:text-[16px] font-black font-mono leading-none">{formatExact(amount as number)}</span>
                    </div>
                  ))}
                  {table.manualServiceFee > 0 && (
                    <div className="bg-blue-600/20 border border-blue-600/40 text-blue-400 px-2 py-1 rounded-lg flex flex-col items-center min-w-[60px] md:min-w-[80px]">
                      <span className="text-[6px] md:text-[9px] font-black uppercase opacity-70">Taxa</span>
                      <span className="text-[10px] md:text-[16px] font-black font-mono leading-none">{formatExact(table.manualServiceFee)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-700 pt-3 md:pt-0 md:pl-6">
                <div className="text-right">
                  <span className="text-gray-500 text-[10px] md:text-[14px] block uppercase font-black">Total Pagado</span>
                  <span className="text-indigo-400 font-black font-mono text-[22px] md:text-[42px] leading-none">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                <div className="text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}

        {tables.length === 0 && (
          <div className="p-12 text-center bg-[#242424] rounded-xl border border-gray-800">
            <p className="text-gray-600 text-[18px] font-black uppercase">Sin historial.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicedTables;
