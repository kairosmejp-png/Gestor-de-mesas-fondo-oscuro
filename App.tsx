
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Product, GlobalTotals, MenuItem } from './types';
import SummaryPanel from './components/SummaryPanel';
import TableCard from './components/TableCard';
import TableDetail from './components/TableDetail';
import MenuManager from './components/MenuManager';
import SalesSummary from './components/SalesSummary';

const STORAGE_KEY = 'gestor_mesas_pro_data';
const MENU_STORAGE_KEY = 'gestor_mesas_pro_menu';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);

  // Persistence: Load from localStorage
  useEffect(() => {
    const savedTables = localStorage.getItem(STORAGE_KEY);
    const savedMenu = localStorage.getItem(MENU_STORAGE_KEY);
    
    let currentTables: Table[] = [];
    if (savedTables) {
      try {
        currentTables = JSON.parse(savedTables);
      } catch (e) {
        console.error("Error loading tables", e);
      }
    }

    if (savedMenu) {
      try {
        setMenu(JSON.parse(savedMenu));
      } catch (e) {
        console.error("Error loading menu", e);
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

  // Persistence: Save tables
  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    }
  }, [tables]);

  // Persistence: Save menu
  useEffect(() => {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
  }, [menu]);

  const globalTotals = useMemo<GlobalTotals>(() => {
    return tables.reduce((acc, t) => {
      const tablePaymentsSum = t.payments.cash + t.payments.pix + t.payments.debit + t.payments.credit;
      acc.totalBilled += tablePaymentsSum;
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
    const nextNumber = tables.length > 0 ? Math.max(...tables.filter(t => t.name !== 'Ventanilla').map(t => t.number), 0) + 1 : 1;
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
  const ventanillaTable = tables.find(t => t.name === 'Ventanilla');
  const regularTables = tables.filter(t => t.name !== 'Ventanilla');

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[#121212] text-gray-200">
      {isMenuOpen ? (
        <MenuManager 
          menu={menu} 
          onUpdate={setMenu} 
          onBack={() => setIsMenuOpen(false)} 
        />
      ) : isSalesOpen ? (
        <SalesSummary 
          tables={tables}
          onBack={() => setIsSalesOpen(false)}
        />
      ) : selectedTable ? (
        <TableDetail 
          table={selectedTable} 
          menu={menu}
          onBack={() => setSelectedTableId(null)} 
          onUpdate={updateTable}
          onDelete={() => deleteTable(selectedTable.id)}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* SECCIÓN FIJA SUPERIOR */}
          <div className="sticky top-0 z-50 bg-[#121212] pt-2 pb-6 border-b border-gray-800 -mx-4 px-4 md:-mx-6 md:px-6 mb-2">
            <div className="flex flex-col xl:flex-row items-start gap-4">
               {/* Sumatorias finales */}
               <div className="flex-1 w-full">
                  <SummaryPanel totals={globalTotals} />
               </div>
               
               {/* Mesa Ventanilla */}
               {ventanillaTable && (
                 <div className="w-full sm:w-48 shrink-0">
                    <TableCard 
                      table={ventanillaTable} 
                      onClick={() => setSelectedTableId(ventanillaTable.id)} 
                      onNameChange={() => {}} 
                    />
                 </div>
               )}

               {/* Botones de acción */}
               <div className="flex flex-row xl:flex-col gap-2 shrink-0 w-full xl:w-auto">
                  <button 
                      onClick={() => setIsMenuOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-[18px] justify-center flex-1 xl:flex-none"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      MENÚ
                  </button>
                  <button 
                      onClick={() => setIsSalesOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-[18px] justify-center flex-1 xl:flex-none"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      VENTAS
                  </button>
               </div>
            </div>
          </div>
          
          {/* GRILLA DE MESAS SCROLLABLE */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 items-start pb-10">
            {regularTables.map(table => (
              <TableCard 
                key={table.id} 
                table={table} 
                onClick={() => setSelectedTableId(table.id)} 
                onNameChange={(name) => updateTable({ ...table, name })}
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
