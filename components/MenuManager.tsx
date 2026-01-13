
import React, { useState } from 'react';
import { MenuItem } from '../types';

interface MenuManagerProps {
  menu: MenuItem[];
  onUpdate: (menu: MenuItem[]) => void;
  onBack: () => void;
}

const MenuManager: React.FC<MenuManagerProps> = ({ menu, onUpdate, onBack }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim().toUpperCase(),
      price: parseFloat(newItemPrice) || 0
    };
    onUpdate([...menu, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const deleteItem = (id: string) => {
    onUpdate(menu.filter(item => item.id !== id));
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2 
  });

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-4 md:p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[24px] md:text-[32px] font-bold text-white uppercase tracking-wider">Menú</h1>
        </div>
      </div>

      <div className="bg-[#242424] p-3 md:p-6 rounded-lg border border-gray-800 mb-6 md:mb-8">
        <h2 className="text-gray-400 uppercase font-black mb-2 text-[12px] md:text-[18px]">Nuevo Producto</h2>
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <input 
            type="text" 
            placeholder="Nombre..." 
            className="bg-gray-800 border-none rounded-lg p-3 md:p-4 flex-1 text-white text-[16px] md:text-[24px] focus:ring-2 focus:ring-blue-500 outline-none uppercase"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              step="0.01"
              placeholder="Precio" 
              className="bg-gray-800 border-none rounded-lg p-3 md:p-4 w-full md:w-48 text-right text-white text-[16px] md:text-[24px] font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
            />
            <button 
              onClick={addItem}
              className="bg-green-600 hover:bg-green-700 text-white font-black px-4 md:px-8 py-3 md:py-0 rounded-lg transition-colors text-[14px] md:text-[20px] uppercase"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-[#2d2d2d] text-gray-400 text-[10px] md:text-[19px] uppercase">
            <tr>
              <th className="p-3 w-[55%]">Producto</th>
              <th className="p-3 text-right w-[30%]">Precio</th>
              <th className="p-3 w-[15%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {menu.sort((a,b) => a.name.localeCompare(b.name)).map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3 text-white font-bold text-[14px] md:text-[28px] uppercase truncate">{item.name}</td>
                <td className="p-3 text-right text-blue-400 font-black font-mono text-[14px] md:text-[28px] truncate">{formatCurrency(item.price)}</td>
                <td className="p-3 text-center">
                  <button onClick={() => deleteItem(item.id)} className="text-gray-600 hover:text-red-500 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

export default MenuManager;
