
import React from 'react';
import { Table } from '../types';

interface TableCardProps {
  table: Table;
  onClick: () => void;
  onNameChange: (name: string) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick, onNameChange }) => {
  const isVentanilla = table.name === 'Ventanilla';
  
  const suggestedTotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const suggestedTotalWithFee = suggestedTotal * 1.1; // 10% fee
  
  const allDelivered = table.products.length > 0 && table.products.every(p => p.delivered);
  // Fix: Explicitly cast Object.values to number[] to avoid 'unknown' type in reduce
  const isPaid = table.manualTotal > 0 && ((Object.values(table.payments) as number[]).reduce((a, b) => a + b, 0) >= table.manualTotal);

  let bgColor = 'bg-red-600';
  if (isVentanilla) {
    bgColor = 'bg-purple-700';
  } else if (isPaid && allDelivered) {
    bgColor = 'bg-blue-600';
  } else if (isPaid && !allDelivered) {
    bgColor = 'bg-orange-500';
  } else if (!isPaid && allDelivered) {
    bgColor = 'bg-green-600';
  } else if (table.products.length === 0) {
    bgColor = 'bg-gray-700';
  }

  // Redondeo automático
  const format = (val: number) => Math.round(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div 
      className={`relative rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${bgColor} border border-white/10 h-32 flex flex-col p-2 text-white`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className="text-[12px] font-bold opacity-60">{isVentanilla ? 'BOX' : `#${table.number}`}</span>
        <input
          disabled={isVentanilla}
          type="text"
          value={table.name}
          className={`bg-transparent border-none focus:outline-none ${!isVentanilla && 'focus:ring-1 focus:ring-white/50'} rounded px-1 font-bold text-[18px] w-full text-right`}
          onChange={(e) => {
            e.stopPropagation();
            onNameChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center -mt-1">
        {!isVentanilla ? (
          <>
            <span className="text-[11px] opacity-80 uppercase font-black tracking-tighter">Sugerido</span>
            <span className="text-[38px] font-black leading-none tracking-tighter">
              {format(suggestedTotalWithFee)}
            </span>
          </>
        ) : (
          <span className="text-[38px] font-black leading-none tracking-tighter">
            {format(table.manualTotal)}
          </span>
        )}
      </div>

      <div className="mt-auto pt-1 border-t border-white/20 flex justify-between items-center text-[13px]">
        <span className="opacity-80 uppercase text-[10px] font-bold">{isVentanilla ? 'Total' : 'Facturado'}</span>
        <span className="font-bold">{format(table.manualTotal)}</span>
      </div>
    </div>
  );
};

export default TableCard;
