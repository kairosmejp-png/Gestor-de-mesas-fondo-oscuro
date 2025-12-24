
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
      name: newItemName.trim(),
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
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[32px] font-bold text-white uppercase tracking-wider">Gestión del Menú</h1>
        </div>
      </div>

      <div className="bg-[#242424] p-6 rounded-lg border border-gray-800 mb-8">
        <h2 className="text-gray-400 uppercase font-black mb-4 text-[18px]">Nuevo Producto</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Nombre del producto..." 
            className="bg-gray-800 border-none rounded-lg p-4 flex-1 text-white text-[24px] focus:ring-2 focus:ring-blue-500 outline-none"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <input 
            type="number" 
            step="0.01"
            placeholder="Precio" 
            className="bg-gray-800 border-none rounded-lg p-4 w-48 text-right text-white text-[24px] font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
          />
          <button 
            onClick={addItem}
            className="bg-green-600 hover:bg-green-700 text-white font-black px-8 rounded-lg transition-colors text-[20px]"
          >
            AÑADIR AL MENÚ
          </button>
        </div>
      </div>

      <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#2d2d2d] text-gray-400 text-[19px] uppercase">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4 text-right">Precio</th>
              <th className="p-4 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {menu.sort((a,b) => a.name.localeCompare(b.name)).map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-bold text-[28px]">{item.name}</td>
                <td className="p-4 text-right text-blue-400 font-black font-mono text-[28px]">{formatCurrency(item.price)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => deleteItem(item.id)} className="text-gray-600 hover:text-red-500 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {menu.length === 0 && (
              <tr>
                <td colSpan={3} className="p-12 text-center text-gray-600 text-[24px] font-bold">
                  No hay productos cargados en el menú.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManager;
