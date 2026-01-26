
import React from 'react';
import { Table, GlobalTotals, Purchase } from '../types';
import SummaryPanel from './SummaryPanel';

interface SalesSummaryProps {
  tables: Table[];
  purchases: Purchase[];
  totals: GlobalTotals;
  onBack: () => void;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ tables, purchases, totals, onBack }) => {
  const salesMap = new Map<string, { name: string; quantity: number; totalRevenue: number }>();

  // Agrupar productos de todas las mesas
  tables.forEach(table => {
    table.products.forEach(prod => {
      const name = prod.description.trim() || 'Sin descripción';
      const existing = salesMap.get(name);
      if (existing) {
        existing.quantity += prod.quantity;
        existing.totalRevenue += (prod.quantity * prod.unitPrice);
      } else {
        salesMap.set(name, {
          name,
          quantity: prod.quantity,
          totalRevenue: prod.quantity * prod.unitPrice
        });
      }
    });
  });

  const salesList = Array.from(salesMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    minimumFractionDigits: 2 
  });

  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl shadow-2xl p-4 md:p-6 border border-gray-800 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-[24px] md:text-[32px] font-bold text-white uppercase tracking-wider">Ventas</h1>
        </div>
      </div>

      <div className="mb-6 md:mb-8">
        <SummaryPanel totals={totals} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
          <h2 className="p-4 bg-[#2d2d2d] text-white font-black uppercase text-[18px]">Desglose de Productos</h2>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2d2d2d] text-gray-400 text-[14px] md:text-[19px] uppercase">
              <tr>
                <th className="p-3 md:p-4">Producto</th>
                <th className="p-3 md:p-4 text-center">Unid.</th>
                <th className="p-3 md:p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {salesList.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 md:p-4 text-white font-bold text-[16px] md:text-[26px] uppercase">{item.name}</td>
                  <td className="p-3 md:p-4 text-center text-gray-300 font-black text-[16px] md:text-[26px]">{item.quantity}</td>
                  <td className="p-3 md:p-4 text-right text-blue-400 font-black font-mono text-[16px] md:text-[26px]">{formatCurrency(item.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
          <h2 className="p-4 bg-[#2d2d2d] text-yellow-500 font-black uppercase text-[18px]">Desglose de Compras / Gastos</h2>
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#2d2d2d] text-gray-400 text-[14px] md:text-[19px] uppercase">
              <tr>
                <th className="p-3 md:p-4">Gasto</th>
                <th className="p-3 md:p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {purchases.map((p, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 md:p-4 text-white font-bold text-[16px] md:text-[26px] uppercase">{p.description}</td>
                  <td className="p-3 md:p-4 text-right text-red-400 font-black font-mono text-[16px] md:text-[26px]">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-gray-600 font-bold uppercase">Sin gastos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;
