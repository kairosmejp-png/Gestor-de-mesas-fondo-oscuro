
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Product, GlobalTotals, MenuItem } from './types';
import TableCard from './components/TableCard';
import TableDetail from './components/TableDetail';
import MenuManager from './components/MenuManager';
import SalesSummary from './components/SalesSummary';
import WaitingList from './components/WaitingList';
import InvoicedTables from './components/InvoicedTables';

const STORAGE_KEY = 'gestor_mesas_pro_data';
const MENU_STORAGE_KEY = 'gestor_mesas_pro_menu';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isWaitingOpen, setIsWaitingOpen] = useState(false);
  const [isInvoicedTablesOpen, setIsInvoicedTablesOpen] = useState(false);

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
    } else {
      // Si no hay menú, sembramos los productos iniciales solicitados (Lista Completa)
      const initialMenu: MenuItem[] = [
        // Bebidas Básicas
        { id: crypto.randomUUID(), name: 'REFRIGERANTE', price: 8 },
        { id: crypto.randomUUID(), name: 'AGUA', price: 5 },
        { id: crypto.randomUUID(), name: 'LATA SUCO', price: 10 },
        { id: crypto.randomUUID(), name: 'LATAO CERVEJA', price: 13 },
        { id: crypto.randomUUID(), name: 'LONGNECK CERVEJA', price: 15 },
        // Cervezas 600ml
        { id: crypto.randomUUID(), name: 'HEINEKEN 600ML', price: 22 },
        { id: crypto.randomUUID(), name: 'ORIGINAL ANTARTICA 600ML', price: 22 },
        { id: crypto.randomUUID(), name: 'ANTARTICA REGULAR 600ML', price: 18 },
        { id: crypto.randomUUID(), name: 'BRAHMA 600ML', price: 18 },
        { id: crypto.randomUUID(), name: 'AMSTEL 600ML', price: 18 },
        // Otros Bebidas
        { id: crypto.randomUUID(), name: 'LATA MIX ALCOOL', price: 10 },
        { id: crypto.randomUUID(), name: 'ENERGETICO/ENERGIZANTE', price: 20 },
        // Tragos y Cócteles
        { id: crypto.randomUUID(), name: 'CAIPIRINHA', price: 15 },
        { id: crypto.randomUUID(), name: 'CAIPIFRUTA', price: 20 },
        { id: crypto.randomUUID(), name: 'CAIPIVODKA', price: 20 },
        { id: crypto.randomUUID(), name: 'CAIPIVODKA FRUTAL', price: 25 },
        { id: crypto.randomUUID(), name: 'CACHAÇA PREMIUM', price: 10 },
        { id: crypto.randomUUID(), name: 'CHAVE DE FENDA', price: 20 },
        { id: crypto.randomUUID(), name: 'RUM', price: 40 },
        { id: crypto.randomUUID(), name: 'CUBA LIBRE', price: 40 },
        { id: crypto.randomUUID(), name: 'MOJITO', price: 40 },
        { id: crypto.randomUUID(), name: 'DAIKIRI', price: 40 },
        { id: crypto.randomUUID(), name: 'TEQUILA', price: 35 },
        { id: crypto.randomUUID(), name: 'WISHKEY', price: 35 },
        // Raciones
        { id: crypto.randomUUID(), name: 'BATATA FRITA', price: 25 },
        { id: crypto.randomUUID(), name: 'FRANGO A PASSARINHO', price: 60 },
        { id: crypto.randomUUID(), name: 'LULA AO DORE', price: 60 },
        { id: crypto.randomUUID(), name: 'CAMARAO ALHO E OLEO', price: 70 },
        { id: crypto.randomUUID(), name: 'CAMARAO', price: 75 },
        { id: crypto.randomUUID(), name: 'CARNE ACEBOLADA', price: 60 },
        { id: crypto.randomUUID(), name: 'LINGUIÇA ACEBOLADA', price: 60 },
        { id: crypto.randomUUID(), name: 'ISCA DE PEIXE', price: 60 },
        { id: crypto.randomUUID(), name: 'ISCA DE FRANGO', price: 60 },
        { id: crypto.randomUUID(), name: 'ESPETINHO', price: 15 },
        // Pizzas
        { id: crypto.randomUUID(), name: 'PIZZA MUSSARELA', price: 65 },
        { id: crypto.randomUUID(), name: 'PIZZA PRESUNTO', price: 70 },
        { id: crypto.randomUUID(), name: 'PIZZA MARGHERITA', price: 70 },
        { id: crypto.randomUUID(), name: 'PIZZA CALABRESA', price: 70 },
        { id: crypto.randomUUID(), name: 'PIZZA FRANGO E CATUPIRY', price: 80 },
        { id: crypto.randomUUID(), name: 'PIZZA PORTUGUESA', price: 90 },
        { id: crypto.randomUUID(), name: 'PIZZA PEITO DE PERU', price: 120 },
        // Platos Principales
        { id: crypto.randomUUID(), name: 'FILE MIGNON', price: 70 },
        { id: crypto.randomUUID(), name: 'COXA E SOBRE COXA', price: 40 },
        { id: crypto.randomUUID(), name: 'CONTRA FILE', price: 50 },
        { id: crypto.randomUUID(), name: 'CHURRASCO MISTO', price: 50 },
        { id: crypto.randomUUID(), name: 'MILANESA PARMEGIANA CARNE', price: 50 },
        { id: crypto.randomUUID(), name: 'MILANESA PARMEGIANA FRANGO', price: 50 },
        { id: crypto.randomUUID(), name: 'PICANHA ARGENTINA', price: 70 },
        { id: crypto.randomUUID(), name: 'PEIXE GRATINADO', price: 60 },
        { id: crypto.randomUUID(), name: 'MOQUECA', price: 60 },
        { id: crypto.randomUUID(), name: 'STROGONOFF', price: 35 },
        { id: crypto.randomUUID(), name: 'MACARRAO AO MOLHO CAMARAO', price: 60 },
        { id: crypto.randomUUID(), name: 'PIRAO DE PANKA', price: 60 },
        { id: crypto.randomUUID(), name: 'DOMINGOS AO ESPIEDO', price: 45 }
      ];
      setMenu(initialMenu);
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(initialMenu));
    }

    const hasBalcao = currentTables.some(t => t.name === 'BALCAO');
    if (!hasBalcao) {
      const balcao: Table = {
        id: 'table-ventanilla',
        number: 0,
        name: 'BALCAO',
        products: [],
        manualServiceFee: 0,
        manualTotal: 0,
        payments: { cash: 0, pix: 0, debit: 0, credit: 0 },
        splitCount: 1,
        paymentRecords: []
      };
      currentTables = [balcao, ...currentTables];
    }
    setTables(currentTables);
  }, []);

  useEffect(() => {
    if (tables.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    }
  }, [tables]);

  useEffect(() => {
    if (menu.length > 0) {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menu));
    }
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

  const isTableInvoiced = (table: Table) => {
    const totalPayments = table.payments.cash + table.payments.pix + table.payments.debit + table.payments.credit;
    if (table.name === 'BALCAO') {
      return table.manualTotal > 0 && totalPayments >= table.manualTotal;
    }
    
    const subtotal = table.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
    return subtotal > 0 && totalPayments >= subtotal;
  };

  const addTable = () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.filter(t => t.name !== 'BALCAO').map(t => t.number), 0) + 1 : 1;
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
    if (tableToDelete?.name === 'BALCAO') {
      alert("No se puede eliminar la mesa BALCAO.");
      return;
    }
    setTables(prev => prev.filter(t => t.id !== id));
    if (selectedTableId === id) setSelectedTableId(null);
  };

  const closeAllViews = () => {
    setIsMenuOpen(false);
    setIsSalesOpen(false);
    setIsWaitingOpen(false);
    setIsInvoicedTablesOpen(false);
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const balcaoTable = tables.find(t => t.name === 'BALCAO');
  
  const openTables = tables.filter(t => t.name !== 'BALCAO' && !isTableInvoiced(t));
  const invoicedTables = tables.filter(t => isTableInvoiced(t));

  const formatCurrency = (val: number) => Math.round(val).toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    maximumFractionDigits: 0 
  });

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[#121212] text-gray-200">
      {isMenuOpen ? (
        <MenuManager menu={menu} onUpdate={setMenu} onBack={closeAllViews} />
      ) : isSalesOpen ? (
        <SalesSummary tables={tables} totals={globalTotals} onBack={closeAllViews} />
      ) : isWaitingOpen ? (
        <WaitingList tables={tables} onUpdateTable={updateTable} onBack={closeAllViews} />
      ) : isInvoicedTablesOpen ? (
        <InvoicedTables tables={invoicedTables} onSelectTable={(id) => { setSelectedTableId(id); closeAllViews(); }} onBack={closeAllViews} />
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
          <div className="sticky top-0 z-50 bg-[#121212] pt-2 border-b border-gray-800 -mx-4 px-4 md:-mx-6 md:px-6 mb-2 h-28 flex items-center">
            <div className="flex flex-row items-center gap-3 h-24 overflow-x-auto overflow-y-hidden no-scrollbar w-full">
               
               {balcaoTable && (
                 <button 
                   onClick={() => setSelectedTableId(balcaoTable.id)}
                   className="min-w-[200px] flex-1 bg-purple-700 hover:bg-purple-600 rounded-lg shadow-lg border border-white/10 px-6 flex items-center justify-between transition-all transform hover:scale-[1.02] active:scale-95 group h-20"
                 >
                    <span className="text-[32px] font-black uppercase tracking-tighter leading-none">BALCAO</span>
                    <span className="text-[34px] font-black leading-none tracking-tighter">
                      {formatCurrency(balcaoTable.manualTotal)}
                    </span>
                 </button>
               )}

               <button 
                  onClick={() => { closeAllViews(); setIsWaitingOpen(true); }}
                  className="w-64 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 text-[22px] uppercase px-4 h-20 shrink-0"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Esperando</span>
               </button>

               <button 
                  onClick={() => { closeAllViews(); setIsInvoicedTablesOpen(true); }}
                  className="w-64 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 text-[24px] uppercase px-4 h-20 shrink-0"
               >
                  <span>Facturadas</span>
               </button>

               <button 
                  onClick={() => { closeAllViews(); setIsSalesOpen(true); }}
                  className="w-52 bg-green-600 hover:bg-green-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 text-[22px] uppercase h-20 shrink-0"
               >
                  <span>Ventas</span>
               </button>

               <button 
                  onClick={() => { closeAllViews(); setIsMenuOpen(true); }}
                  className="w-52 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-95 text-[22px] uppercase h-20 shrink-0"
               >
                  <span>Menú</span>
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 items-start pb-10">
            {openTables.map(table => (
              <TableCard 
                key={table.id} 
                table={table} 
                onClick={() => setSelectedTableId(table.id)} 
                onNameChange={(name) => updateTable({ ...table, name })}
              />
            ))}
            
            <button 
              onClick={addTable}
              className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50 hover:bg-gray-800 hover:border-blue-500 transition-all duration-200 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 group-hover:text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-gray-400 font-semibold group-hover:text-blue-500 text-[18px]">Adicionar Mesa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;