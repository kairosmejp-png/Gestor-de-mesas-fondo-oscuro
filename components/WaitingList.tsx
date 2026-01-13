
import React, { useState, useEffect } from 'react';
import { Table, Product } from '../types';

interface WaitingListProps {
  tables: Table[];
  onUpdateTable: (table: Table) => void;
  onBack: () => void;
}

const WaitingList: React.FC<WaitingListProps> = ({ tables, onUpdateTable, onBack }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingItems = tables.flatMap(table => 
    table.products
      .filter(p => !p.delivered)
      .map(p => ({ 
        tableId: table.id, 
        tableName: table.name, 
        tableNumber: table.number,
        product: p 
      }))
  ).sort((a, b) => {
    const timeA = a.product.createdAt || 0;
    const timeB = b.product.createdAt || 0;
    return timeA - timeB;
  });

  const toggleDelivered = (tableId: string, productId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const updatedProducts = table.products.map(p => 
      p.id === productId ? { ...p, delivered: true } : p
    );

    onUpdateTable({ ...table, products: updatedProducts });
  };

  const formatTimeElapsed = (createdAt?: number) => {
    if (!createdAt) return "--:--";
    const diffInMs = now - createdAt;
    const totalSeconds = Math.floor(diffInMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (totalMinutes < 99) {
      const m = String(totalMinutes).padStart(2, '0');
      const s = String(seconds).padStart(2, '0');
      return `${m}:${s}`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `+${hours}°${String(mins).padStart(2, '0')}'`;
    }
  };

  const getTimeColor = (createdAt?: number) => {
    if (!createdAt) return "text-gray-600";
    const diffInMs = now - createdAt;
    const totalMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (totalMinutes >= 30) return "text-red-500";
    if (totalMinutes >= 15) return "text-orange-400";
    return "text-green-400";
  };

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-3 md:p-6 border border-gray-800 animate-in fade-in duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[20px] md:text-[34px] font-black text-orange-500 uppercase">Esperando</h1>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg">
          <span className="text-orange-400 font-black text-[14px] md:text-[24px]">{pendingItems.length} PEND.</span>
        </div>
      </div>

      <div className="bg-[#242424] rounded-xl border border-gray-800 overflow-hidden shadow-2xl w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-[#2d2d2d] text-gray-400 text-[10px] md:text-[18px] uppercase font-black">
            <tr>
              <th className="p-2 w-[22%] md:w-40">Mesa</th>
              <th className="p-2 w-[12%] md:w-24 text-center">Ct</th>
              <th className="p-2 w-[30%]">Desc</th>
              <th className="p-2 w-[22%] text-center">Reloj</th>
              <th className="p-2 w-[14%] text-center">OK</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {pendingItems.map((item, idx) => (
              <tr key={`${item.tableId}-${item.product.id}`} className="hover:bg-white/5 transition-colors">
                <td className="p-2">
                  <span className="text-white font-black text-[14px] md:text-[24px] uppercase block truncate">{item.tableName}</span>
                  <span className="text-[8px] text-gray-500 font-black">#{item.tableNumber}</span>
                </td>
                <td className="p-2 text-center">
                  <span className="bg-orange-600 text-white font-black text-[16px] md:text-[32px] px-2 py-0.5 rounded-lg">
                    {item.product.quantity}
                  </span>
                </td>
                <td className="p-2">
                  <span className="text-white font-bold text-[14px] md:text-[32px] block truncate">{item.product.description}</span>
                </td>
                <td className="p-2 text-center">
                  <span className={`font-mono font-black text-[14px] md:text-[36px] ${getTimeColor(item.product.createdAt)}`}>
                    {formatTimeElapsed(item.product.createdAt)}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => toggleDelivered(item.tableId, item.product.id)}
                    className="w-8 h-8 md:w-20 md:h-20 rounded-lg bg-red-600 hover:bg-green-600 flex items-center justify-center transition-all shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-12 md:w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitingList;
