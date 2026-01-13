
import React from 'react';
import { Table } from '../types';

interface TableCardProps {
  table: Table;
  onClick: () => void;
  onNameChange: (name: string) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick, onNameChange }) => {
  const isBalcao = table.name === 'BALCAO';
  
  const subtotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const totalQty = table.products.reduce((acc, p) => acc + p.quantity, 0);
  const totalPayments = (Object.values(table.payments) as number[]).reduce((a, b) => a + b, 0);
  const allDelivered = table.products.length > 0 && table.products.every(p => p.delivered);
  
  // Precio sugerido para visualización
  // BALCAO: Subtotal + (0.25 * items)
  // MESAS: Subtotal + 10%
  const suggestedTotal = isBalcao 
    ? (subtotal + (totalQty * 0.25)) 
    : (subtotal * 1.1);

  const isPaid = isBalcao 
    ? (subtotal > 0 && totalPayments >= (subtotal + (totalQty * 0.25)))
    : (subtotal > 0 && totalPayments >= subtotal);

  const formatCurrency = (val: number) => Math.round(val).toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    maximumFractionDigits: 0 
  });

  let bgColor = 'bg-gray-700'; 
  
  if (table.products.length > 0) {
    if (!allDelivered && !isPaid) {
      bgColor = 'bg-red-600';
    } else if (!allDelivered && isPaid) {
      bgColor = 'bg-orange-500';
    } else if (allDelivered && !isPaid) {
      bgColor = 'bg-green-600';
    } else if (allDelivered && isPaid) {
      bgColor = 'bg-blue-600';
    }
  }

  if (isBalcao) {
    bgColor = 'bg-purple-700';
  }

  return (
    <div 
      className={`relative rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${bgColor} border border-white/10 h-24 md:h-32 flex flex-col p-2 md:p-3 text-white`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-1 mb-0.5">
        <span className="text-[9px] md:text-[14px] font-bold opacity-60 shrink-0">{isBalcao ? 'BOX' : `#${table.number}`}</span>
        <input
          disabled={isBalcao}
          type="text"
          value={table.name}
          className={`bg-transparent border-none focus:outline-none ${!isBalcao && 'focus:ring-1 focus:ring-white/50'} rounded px-1 font-black text-[12px] md:text-[20px] w-full text-right uppercase tracking-tighter`}
          onChange={(e) => {
            e.stopPropagation();
            onNameChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center -mt-1">
         <div className="flex flex-col items-center">
           <span className="text-[18px] md:text-[28px] font-black font-mono leading-none tracking-tight">
             {formatCurrency(suggestedTotal)}
           </span>
           <div className="flex gap-1 mt-1">
             {allDelivered && (
               <div className="bg-white/20 p-0.5 rounded">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-4 md:w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
               </div>
             )}
             {isPaid && (
               <div className="bg-yellow-400/20 text-yellow-200 px-1 rounded text-[8px] md:text-[12px] font-bold">
                 $
               </div>
             )}
           </div>
         </div>
      </div>
    </div>
  );
};

export default TableCard;
