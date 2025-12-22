
import React from 'react';
import { Table } from '../types';

interface TableCardProps {
  table: Table;
  onClick: () => void;
  onNameChange: (name: string) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick, onNameChange }) => {
  const suggestedTotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const suggestedTotalWithFee = suggestedTotal * 1.1; // 10% fee
  
  const allDelivered = table.products.length > 0 && table.products.every(p => p.delivered);
  const isPaid = table.manualTotal > 0;

  // Background logic:
  // Verde si todos los pedidos fueron entregados.
  // Rojo si faltan pedidos por entregar.
  // Azul si pagada y todos entregados.
  // Naranja si pagada pero aún faltan entregas.
  let bgColor = 'bg-red-600';
  if (isPaid && allDelivered) {
    bgColor = 'bg-blue-600';
  } else if (isPaid && !allDelivered) {
    bgColor = 'bg-orange-500';
  } else if (!isPaid && allDelivered) {
    bgColor = 'bg-green-600';
  } else if (table.products.length === 0) {
    bgColor = 'bg-gray-700'; // Default for empty
  }

  const format = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div 
      className={`relative rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${bgColor} border border-white/10 h-32 flex flex-col p-2 text-white`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold opacity-70">#{table.number}</span>
      </div>
      
      <input
        type="text"
        value={table.name}
        className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-white/50 rounded px-1 font-bold text-base w-full mb-1"
        onChange={(e) => {
          e.stopPropagation();
          onNameChange(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ fontSize: '16px' }}
      />

      <div className="mt-auto">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-70 leading-none">SUGERIDO</span>
            <span className="text-[12px] font-medium leading-tight">{format(suggestedTotalWithFee)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] opacity-70 leading-none">FACTURADO</span>
            <span className="text-[16px] font-bold leading-tight">{format(table.manualTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
