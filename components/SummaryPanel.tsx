
import React from 'react';
import { GlobalTotals } from '../types';

interface SummaryPanelProps {
  totals: GlobalTotals;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ totals }) => {
  const format = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      <div className="bg-[#1e1e1e] p-4 rounded-lg shadow-lg border border-gray-800">
        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Total Facturado</p>
        <p className="text-green-500 text-2xl font-bold font-mono truncate">{format(totals.totalBilled)}</p>
      </div>
      
      <div className="bg-[#d1d5db] p-4 rounded-lg shadow-lg border border-gray-300">
        <p className="text-gray-600 text-xs uppercase font-bold mb-1">Total Taxa Atendimento</p>
        <p className="text-blue-600 text-2xl font-bold font-mono truncate">{format(totals.totalServiceFee)}</p>
      </div>

      <div className="bg-green-600 p-4 rounded-lg shadow-lg border border-green-700">
        <p className="text-white/80 text-xs uppercase font-bold mb-1">Efectivo</p>
        <p className="text-white text-2xl font-bold font-mono truncate">{format(totals.totalCash)}</p>
      </div>

      <div className="bg-yellow-500 p-4 rounded-lg shadow-lg border border-yellow-600">
        <p className="text-black/70 text-xs uppercase font-bold mb-1">PIX</p>
        <p className="text-black text-2xl font-bold font-mono truncate">{format(totals.totalPix)}</p>
      </div>

      <div className="bg-orange-500 p-4 rounded-lg shadow-lg border border-orange-600">
        <p className="text-white/90 text-xs uppercase font-bold mb-1">Débito</p>
        <p className="text-white text-2xl font-bold font-mono truncate">{format(totals.totalDebit)}</p>
      </div>

      <div className="bg-red-600 p-4 rounded-lg shadow-lg border border-red-700">
        <p className="text-white/90 text-xs uppercase font-bold mb-1">Crédito</p>
        <p className="text-white text-2xl font-bold font-mono truncate">{format(totals.totalCredit)}</p>
      </div>
    </div>
  );
};

export default SummaryPanel;
