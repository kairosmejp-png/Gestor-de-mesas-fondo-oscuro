
import React, { useState } from 'react';
import { GlobalTotals } from '../types';

interface SummaryPanelProps {
  totals: GlobalTotals;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ totals }) => {
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>({});

  const format = (val: number) => Math.round(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  const toggleVisibility = (key: string) => {
    setVisibleItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SummaryCard = ({ 
    label, 
    value, 
    id, 
    bgColor, 
    textColor, 
    borderColor 
  }: { 
    label: string, 
    value: number, 
    id: string, 
    bgColor: string, 
    textColor: string, 
    borderColor: string 
  }) => {
    const isVisible = visibleItems[id];
    return (
      <div 
        onClick={() => toggleVisibility(id)}
        className={`${bgColor} p-3 md:p-4 rounded-lg shadow-lg border ${borderColor} cursor-pointer transition-all hover:brightness-110 active:scale-95 select-none h-28 md:h-28 flex flex-col justify-center`}
      >
        <p className={`${textColor} opacity-80 text-[14px] md:text-[17px] uppercase font-black mb-1`}>{label}</p>
        <div className="relative">
          <p className={`${textColor} font-black font-mono truncate transition-all duration-300 ${!isVisible ? 'text-[20px] md:text-[29px] blur-sm grayscale opacity-40' : 'text-[28px] md:text-[37px]'}`}>
            {isVisible ? format(value) : 'R$ *****'}
          </p>
          {!isVisible && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`${textColor} text-[10px] md:text-[15px] font-black opacity-80 uppercase tracking-widest`}>Ver Monto</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
      <SummaryCard 
        id="billed"
        label="Total Facturado" 
        value={totals.totalBilled} 
        bgColor="bg-[#1e1e1e]" 
        textColor="text-green-500" 
        borderColor="border-gray-800"
      />
      
      <SummaryCard 
        id="fee"
        label="Total Taxa" 
        value={totals.totalServiceFee} 
        bgColor="bg-[#d1d5db]" 
        textColor="text-blue-600" 
        borderColor="border-gray-300"
      />

      <SummaryCard 
        id="cash"
        label="Efectivo" 
        value={totals.totalCash} 
        bgColor="bg-green-600" 
        textColor="text-white" 
        borderColor="border-green-700"
      />

      <SummaryCard 
        id="pix"
        label="PIX" 
        value={totals.totalPix} 
        bgColor="bg-yellow-500" 
        textColor="text-black" 
        borderColor="border-yellow-600"
      />

      <SummaryCard 
        id="debit"
        label="Débito" 
        value={totals.totalDebit} 
        bgColor="bg-sky-400" 
        textColor="text-white" 
        borderColor="border-sky-500"
      />

      <SummaryCard 
        id="credit"
        label="Crédito" 
        value={totals.totalCredit} 
        bgColor="bg-purple-400" 
        textColor="text-white" 
        borderColor="border-purple-500"
      />
    </div>
  );
};

export default SummaryPanel;
