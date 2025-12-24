
import React from 'react';
import { Table } from '../types';

interface TableCardProps {
  table: Table;
  onClick: () => void;
  onNameChange: (name: string) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick, onNameChange }) => {
  const isBalcao = table.name === 'BALCAO';
  
  const suggestedTotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const suggestedTotalWithFee = suggestedTotal * 1.1; // 10% fee
  
  const totalPayments = (Object.values(table.payments) as number[]).reduce((a, b) => a + b, 0);
  const allDelivered = table.products.length > 0 && table.products.every(p => p.delivered);
  
  // Se considera pagada si los cobros cubren el subtotal de productos
  const isPaid = isBalcao 
    ? (table.manualTotal > 0 && totalPayments >= table.manualTotal)
    : (suggestedTotal > 0 && totalPayments >= suggestedTotal);

  let bgColor = 'bg-red-600';
  if (isBalcao) {
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
      className={`relative rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${bgColor} border border-white/10 h-44 flex flex-col p-3 text-white`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-1">
        <span className="text-[14px] font-bold opacity-70 shrink-0">{isBalcao ? 'BOX' : `#${table.number}`}</span>
        <input
          disabled={isBalcao}
          type="text"
          value={table.name}
          className={`bg-transparent border-none focus:outline-none ${!isBalcao && 'focus:ring-1 focus:ring-white/50'} rounded px-1 font-black text-[24px] w-full text-right uppercase tracking-tighter`}
          onChange={(e) => {
            e.stopPropagation();
            onNameChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center -mt-2">
        {!isBalcao ? (
          <>
            <span className="text-[12px] opacity-80 uppercase font-black tracking-tighter">Sugerido</span>
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

      <div className="mt-auto pt-2 border-t border-white/20 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="opacity-80 uppercase text-[10px] font-bold leading-none">{isBalcao ? 'Total' : 'Facturado'}</span>
          <span className="font-black text-[20px] leading-tight">
            {isBalcao ? format(table.manualTotal) : format(totalPayments)}
          </span>
        </div>
        {allDelivered && !isPaid && (
          <span className="bg-white/20 px-1 py-1 rounded text-[9px] font-black uppercase">Pendiente Pago</span>
        )}
      </div>
    </div>
  );
};

export default TableCard;
