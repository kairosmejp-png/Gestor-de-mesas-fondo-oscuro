
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
    // Ordenar por tiempo de creación: el menor timestamp (más antiguo) va primero
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
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[42px] font-black text-orange-500 uppercase tracking-wider">Esperando</h1>
        </div>
        <div className="bg-orange-500/10 border-2 border-orange-500/20 px-8 py-4 rounded-xl">
          <span className="text-orange-400 font-black text-[36px]">{pendingItems.length} PENDIENTES</span>
        </div>
      </div>

      <div className="bg-[#242424] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#2d2d2d] text-gray-400 text-[24px] uppercase font-black">
            <tr>
              <th className="p-8 w-48">Mesa</th>
              <th className="p-8 w-32 text-center">Cant.</th>
              <th className="p-8">Descripción del Producto</th>
              <th className="p-8 text-center w-64">Tiempo</th>
              <th className="p-8 w-40 text-center">Marcar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {pendingItems.map((item, idx) => (
              <tr key={`${item.tableId}-${item.product.id}`} className="hover:bg-white/5 transition-colors border-b border-gray-800/50">
                <td className="p-8">
                  <div className="flex flex-col">
                    <span className="text-white font-black text-[38px] uppercase leading-none mb-1 tracking-tighter">{item.tableName}</span>
                    <span className="text-[16px] text-gray-500 font-black uppercase tracking-widest">#{item.tableNumber}</span>
                  </div>
                </td>
                <td className="p-8 text-center">
                  <span className="bg-orange-600 text-white font-black text-[48px] px-6 py-2 rounded-2xl shadow-lg leading-none inline-block min-w-[80px]">
                    {item.product.quantity}
                  </span>
                </td>
                <td className="p-8">
                  <span className="text-white font-black text-[52px] leading-tight block tracking-tight">{item.product.description}</span>
                </td>
                <td className="p-8 text-center">
                  <span className={`font-mono font-black text-[56px] tracking-tighter ${getTimeColor(item.product.createdAt)}`}>
                    {formatTimeElapsed(item.product.createdAt)}
                  </span>
                </td>
                <td className="p-8 text-center">
                  <button 
                    onClick={() => toggleDelivered(item.tableId, item.product.id)}
                    className="w-28 h-28 rounded-3xl bg-red-600 hover:bg-green-600 flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 shadow-2xl group border-4 border-white/5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white group-hover:scale-125 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {pendingItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-32 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-green-500 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 text-[48px] font-black uppercase tracking-[0.2em]">¡SIN PEDIDOS!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitingList;
