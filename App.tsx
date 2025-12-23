
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Product, GlobalTotals } from './types';
import SummaryPanel from './components/SummaryPanel';
import TableCard from './components/TableCard';
import TableDetail from './components/TableDetail';

const STORAGE_KEY = 'gestor_mesas_pro_data';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Persistence: Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let currentTables: Table[] = [];
    if (saved) {
      try {
        currentTables = JSON.parse(saved);
      } catch (e) {
        console.error("Error loading data", e);
      }
    }

    // Asegurar que exista "Ventanilla"
    const hasVentanilla = currentTables.some(t => t.name === 'Ventanilla');
    if (!hasVentanilla) {
      const ventanilla: Table = {
        id: 'table-ventanilla',
        number: 0,
        name: 'Ventanilla',
        products: [],
        manualServiceFee: 0,
        manualTotal: 0,
        payments: { cash: 0, pix: 0, debit: 0, credit: 0 },
        splitCount: 1,
        paymentRecords: []
      };
      currentTables = [ventanilla, ...currentTables];
    }
    setTables(currentTables);
  }, []);

  // Persistence: Save to localStorage
  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    }
  }, [tables]);

  const globalTotals = useMemo<GlobalTotals>(() => {
    return tables.reduce((acc, t) => {
      acc.totalBilled += t.manualTotal;
      acc.totalServiceFee += t.manualServiceFee;
      acc.totalCash += t.payments.cash;
      acc.totalPix += t.payments.pix;
      acc.totalDebit += t.payments.debit;
      acc.totalCredit += t.payments.credit;
      return acc;
    }, {
      totalBilled: 0,
      totalServiceFee: 0,
      totalCash: 0,
      totalPix: 0,
      totalDebit: 0,
      totalCredit: 0
    });
  }, [tables]);

  const addTable = () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
    const newTable: Table = {
      id: crypto.randomUUID(),
      number: nextNumber,
      name: `Mesa ${nextNumber}`,
      products: [],
      manualServiceFee: 0,
      manualTotal: 0,
      payments: { cash: 0, pix: 0, debit: 0, credit: 0 },
      splitCount: 1
    };
    setTables(prev => [...prev, newTable]);
  };

  const updateTable = (updatedTable: Table) => {
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
  };

  const deleteTable = (id: string) => {
    const tableToDelete = tables.find(t => t.id === id);
    if (tableToDelete?.name === 'Ventanilla') {
      alert("No se puede eliminar la mesa Ventanilla.");
      return;
    }
    setTables(prev => prev.filter(t => t.id !== id));
    if (selectedTableId === id) setSelectedTableId(null);
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[#121212] text-gray-200">
      {selectedTable ? (
        <TableDetail 
          table={selectedTable} 
          onBack={() => setSelectedTableId(null)} 
          onUpdate={updateTable}
          onDelete={() => deleteTable(selectedTable.id)}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <SummaryPanel totals={globalTotals} />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 items-start">
            {tables.map(table => (
              <TableCard 
                key={table.id} 
                table={table} 
                onClick={() => setSelectedTableId(table.id)} 
                onNameChange={(name) => table.name !== 'Ventanilla' && updateTable({ ...table, name })}
              />
            ))}
            
            <button 
              onClick={addTable}
              className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50 hover:bg-gray-800 hover:border-blue-500 transition-all duration-200 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 group-hover:text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-gray-400 font-semibold group-hover:text-blue-500 text-[19px]">Adicionar Mesa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
