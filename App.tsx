
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Product, GlobalTotals, MenuItem, InventoryItem, Purchase } from './types';
import TableCard from './components/TableCard';
import TableDetail from './components/TableDetail';
import MenuManager from './components/MenuManager';
import SalesSummary from './components/SalesSummary';
import WaitingList from './components/WaitingList';
import InvoicedTables from './components/InvoicedTables';
import InventoryManager from './components/InventoryManager';
import PurchasesManager from './components/PurchasesManager';

const STORAGE_KEY = 'gestor_mesas_pro_data';
const MENU_STORAGE_KEY = 'gestor_mesas_pro_menu';
const INVENTORY_STORAGE_KEY = 'gestor_mesas_pro_inventory';
const PURCHASES_STORAGE_KEY = 'gestor_mesas_pro_purchases';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isWaitingOpen, setIsWaitingOpen] = useState(false);
  const [isInvoicedTablesOpen, setIsInvoicedTablesOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);

  useEffect(() => {
    const savedTables = localStorage.getItem(STORAGE_KEY);
    const savedMenu = localStorage.getItem(MENU_STORAGE_KEY);
    const savedInventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
    const savedPurchases = localStorage.getItem(PURCHASES_STORAGE_KEY);
    
    let currentTables: Table[] = [];
    if (savedTables) {
      try {
        currentTables = JSON.parse(savedTables);
      } catch (e) {
        console.error("Error loading tables", e);
      }
    }

    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (e) {
        console.error("Error loading inventory", e);
      }
    }

    if (savedPurchases) {
      try {
        setPurchases(JSON.parse(savedPurchases));
      } catch (e) {
        console.error("Error loading purchases", e);
      }
    }

    if (savedMenu) {
      try {
        setMenu(JSON.parse(savedMenu));
      } catch (e) {
        console.error("Error loading menu", e);
      }
    } else {
      const initialMenu: MenuItem[] = [
        { id: crypto.randomUUID(), name: 'REFRIGERANTE', price: 8 },
        { id: crypto.randomUUID(), name: 'AGUA C/S GAS', price: 5 },
        { id: crypto.randomUUID(), name: 'LATA SUCO', price: 10 },
        { id: crypto.randomUUID(), name: 'SUCO NATURAL', price: 15 },
        { id: crypto.randomUUID(), name: 'LATAO CERVEJA', price: 13 },
        { id: crypto.randomUUID(), name: 'LONGNECK CERVEJA', price: 15 },
        { id: crypto.randomUUID(), name: 'HEINEKEN 600ML', price: 22 },
        { id: crypto.randomUUID(), name: 'ORIGINAL ANTARTICA 600ML', price: 22 },
        { id: crypto.randomUUID(), name: 'ANTARTICA REGULAR 600ML', price: 18 },
        { id: crypto.randomUUID(), name: 'BRAHMA 600ML', price: 18 },
        { id: crypto.randomUUID(), name: 'AMSTEL 600ML', price: 18 },
        { id: crypto.randomUUID(), name: 'LATA MIX ALCOOL', price: 10 },
        { id: crypto.randomUUID(), name: 'ENERGETICO/ENERGIZANTE', price: 20 },
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
        { id: crypto.randomUUID(), name: 'PZZ MUSSARELA', price: 65 },
        { id: crypto.randomUUID(), name: 'PZZ PRESUNTO', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ MARGHERITA', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ CALABRESA', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ FRANGO E CATUPIRY', price: 80 },
        { id: crypto.randomUUID(), name: 'PZZ PORTUGUESA', price: 90 },
        { id: crypto.randomUUID(), name: 'PZZ PEITO DE PERU', price: 120 },
        { id: crypto.randomUUID(), name: 'PZZ PORTU/FRANGO', price: 90 },
        { id: crypto.randomUUID(), name: 'PZZ PORTU/PRESUNTO', price: 90 },
        { id: crypto.randomUUID(), name: 'PZZ PORTU/MUSSA', price: 90 },
        { id: crypto.randomUUID(), name: 'PZZ PORTU/MARGUERITE', price: 90 },
        { id: crypto.randomUUID(), name: 'PZZ PORTU/CALA', price: 90 },
        { id: crypto.randomUUID(), name: 'PZZ FRANGO/CALA', price: 80 },
        { id: crypto.randomUUID(), name: 'PZZ FRANGO/MARGUERITE', price: 80 },
        { id: crypto.randomUUID(), name: 'PZZ FRANGO/MUSSA', price: 80 },
        { id: crypto.randomUUID(), name: 'PZZ FRANGO/PRESUNTO', price: 80 },
        { id: crypto.randomUUID(), name: 'PZZ CALA/MARGUERITE', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ CALA/MUSSA', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ CALA/PRESUNTO', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ MARGUERITE/MUSSA', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ MARGUERITE/PRESUNTO', price: 70 },
        { id: crypto.randomUUID(), name: 'PZZ PRESUNTO/MUSSA', price: 70 },
        { id: crypto.randomUUID(), name: 'FILE MIGNON', price: 70 },
        { id: crypto.randomUUID(), name: 'FILE DE FRANGO', price: 50 },
        { id: crypto.randomUUID(), name: 'FILE DE PEIXE', price: 60 },
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
        { id: crypto.randomUUID(), name: 'DOMINGOS AO ESPIEDO', price: 45 },
        { id: crypto.randomUUID(), name: 'REFRIGERANTE 1,5L', price: 20 },
        { id: crypto.randomUUID(), name: 'FRANGO GRELHADO', price: 50 },
        { id: crypto.randomUUID(), name: 'ARROZ', price: 10 },
        { id: crypto.randomUUID(), name: 'FEIJAO', price: 10 },
        { id: crypto.randomUUID(), name: 'SALADA', price: 10 }
      ];
      setMenu(initialMenu);
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(initialMenu));
    }

    const hasBalcao = currentTables.some(t => t.id === 'table-ventanilla');
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
        paymentRecords: [],
        isInvoiced: false
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
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchases));
  }, [purchases]);

  const globalTotals = useMemo<GlobalTotals>(() => {
    const totals = tables.reduce((acc, t) => {
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
      totalCredit: 0,
      totalPurchases: 0
    });

    purchases.forEach(p => {
      totals.totalPurchases += p.amount;
      if (p.method === 'cash') totals.totalCash -= p.amount;
      else if (p.method === 'pix') totals.totalPix -= p.amount;
      else if (p.method === 'debit') totals.totalDebit -= p.amount;
      else if (p.method === 'credit') totals.totalCredit -= p.amount;
    });

    return totals;
  }, [tables, purchases]);

  const addTable = () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.filter(t => t.id !== 'table-ventanilla' && !t.isInvoiced).map(t => t.number), 0) + 1 : 1;
    const newTable: Table = {
      id: crypto.randomUUID(),
      number: nextNumber,
      name: `Mesa ${nextNumber}`,
      products: [],
      manualServiceFee: 0,
      manualTotal: 0,
      payments: { cash: 0, pix: 0, debit: 0, credit: 0 },
      splitCount: 1,
      isInvoiced: false
    };
    setTables(prev => [...prev, newTable]);
  };

  const updateTable = (updatedTable: Table) => {
    const subtotal = updatedTable.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
    const totalPayments = (Object.values(updatedTable.payments) as number[]).reduce((a, b) => a + b, 0);
    const allDelivered = updatedTable.products.length > 0 && updatedTable.products.every(p => p.delivered);
    
    // Ahora permitimos excedente en BALCAO para que se sume a la Taxa global
    const actualExcedente = Math.max(0, totalPayments - subtotal);
    
    const isPaid = (subtotal > 0 && totalPayments >= subtotal);
    const allDeliveredValid = updatedTable.products.length > 0 && updatedTable.products.every(p => p.delivered);
    const isBlue = allDeliveredValid && isPaid;

    let shouldReturnToDashboard = false;
    let finalTable = { ...updatedTable, manualServiceFee: actualExcedente };

    if (updatedTable.id !== 'table-ventanilla') {
      if (!updatedTable.isInvoiced && isBlue) {
        finalTable.isInvoiced = true;
        shouldReturnToDashboard = true;
      } 
      else if (updatedTable.isInvoiced && !isPaid) {
        finalTable.isInvoiced = false;
        shouldReturnToDashboard = true;
      }
    }

    setTables(prev => prev.map(t => t.id === finalTable.id ? finalTable : t));

    if (shouldReturnToDashboard && selectedTableId === finalTable.id) {
      setSelectedTableId(null);
    }
  };

  const deleteTable = (id: string) => {
    if (id === 'table-ventanilla') {
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
    setIsInventoryOpen(false);
    setIsPurchasesOpen(false);
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const balcaoTable = tables.find(t => t.id === 'table-ventanilla');
  
  const openTables = tables.filter(t => t.id !== 'table-ventanilla' && !t.isInvoiced);
  const invoicedTables = tables.filter(t => t.isInvoiced);

  const formatCurrency = (val: number) => Math.round(val).toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL', 
    maximumFractionDigits: 0 
  });

  const balcaoPaymentsTotal = balcaoTable 
    ? (balcaoTable.payments.cash + balcaoTable.payments.pix + balcaoTable.payments.debit + balcaoTable.payments.credit)
    : 0;

  const ReporBtn = () => (
    <button onClick={() => { closeAllViews(); setIsInventoryOpen(true); }} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform active:scale-95 text-[18px] md:text-[22px] uppercase h-14 md:h-20 px-6 md:px-8">
      <span>Reponer</span>
    </button>
  );

  const ComprasBtn = () => (
    <button onClick={() => { closeAllViews(); setIsPurchasesOpen(true); }} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform active:scale-95 text-[18px] md:text-[22px] uppercase h-14 md:h-20 px-6 md:px-8">
      <span>Compras</span>
    </button>
  );

  const VentasBtn = () => (
    <button onClick={() => { closeAllViews(); setIsSalesOpen(true); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform active:scale-95 text-[18px] md:text-[22px] uppercase h-14 md:h-20 px-6 md:px-8">
      <span>Ventas</span>
    </button>
  );

  const MenuBtn = () => (
    <button onClick={() => { closeAllViews(); setIsMenuOpen(true); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform active:scale-95 text-[18px] md:text-[22px] uppercase h-14 md:h-20 px-6 md:px-8">
      <span>Menú</span>
    </button>
  );

  const EsperandoBtn = () => (
    <button onClick={() => { closeAllViews(); setIsWaitingOpen(true); }} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 text-[18px] md:text-[22px] uppercase h-14 md:h-20 px-4 md:px-8">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Esperando</span>
    </button>
  );

  const FacturadasBtn = () => (
    <button onClick={() => { closeAllViews(); setIsInvoicedTablesOpen(true); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg shadow-lg flex items-center justify-center transition-all transform active:scale-95 text-[18px] md:text-[24px] uppercase h-14 md:h-20 px-4 md:px-8">
      <span>Facturadas</span>
    </button>
  );

  const BalcaoBtn = () => (
    balcaoTable ? (
      <button onClick={() => setSelectedTableId(balcaoTable.id)} className="w-full bg-purple-700 hover:bg-purple-600 rounded-lg shadow-lg border border-white/10 px-4 md:px-6 flex items-center justify-between transition-all transform active:scale-95 h-14 md:h-20">
        <span className="text-[20px] md:text-[32px] font-black uppercase tracking-tighter leading-none">BALCAO</span>
        <div className="flex flex-col items-end">
          <span className="text-[8px] md:text-[10px] font-bold opacity-70 leading-none mb-1 uppercase">PAGOS</span>
          <span className="text-[20px] md:text-[34px] font-black leading-none tracking-tighter">
            {formatCurrency(balcaoPaymentsTotal)}
          </span>
        </div>
      </button>
    ) : null
  );

  return (
    <div className="min-h-screen p-4 md:p-6 bg-[#121212] text-gray-200">
      {isMenuOpen ? (
        <MenuManager menu={menu} onUpdate={setMenu} onBack={closeAllViews} />
      ) : isInventoryOpen ? (
        <InventoryManager inventory={inventory} onUpdate={setInventory} onBack={closeAllViews} />
      ) : isPurchasesOpen ? (
        <PurchasesManager menu={menu} purchases={purchases} onUpdate={setPurchases} onBack={closeAllViews} />
      ) : isSalesOpen ? (
        <SalesSummary tables={tables} purchases={purchases} totals={globalTotals} onBack={closeAllViews} />
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
          <div className="md:sticky md:top-0 z-50 bg-[#121212] pt-2 border-b border-gray-800 -mx-4 px-4 md:-mx-6 md:px-6 mb-2 flex flex-col gap-2">
            <div className="flex flex-col gap-2 md:hidden mb-4">
              <div className="grid grid-cols-3 gap-2">
                <ReporBtn />
                <VentasBtn />
                <MenuBtn />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <EsperandoBtn />
                <FacturadasBtn />
              </div>
              <div className="flex gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <BalcaoBtn />
                </div>
                <div className="shrink-0 w-fit">
                  <ComprasBtn />
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-row items-center gap-3 h-24 overflow-x-auto overflow-y-hidden no-scrollbar w-full">
               <div className="flex-1 min-w-[200px]">
                 <BalcaoBtn />
               </div>
               <div className="shrink-0 w-fit"><EsperandoBtn /></div>
               <div className="shrink-0 w-fit"><FacturadasBtn /></div>
               <div className="shrink-0 w-fit"><ComprasBtn /></div>
               <div className="shrink-0 w-fit"><ReporBtn /></div>
               <div className="shrink-0 w-fit"><VentasBtn /></div>
               <div className="shrink-0 w-fit"><MenuBtn /></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-6 items-start pb-10">
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
              className="flex flex-col items-center justify-center h-24 md:h-32 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50 hover:bg-gray-800 hover:border-blue-500 transition-all duration-200 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-gray-500 group-hover:text-blue-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-gray-400 font-black group-hover:text-blue-500 text-[10px] md:text-[14px] uppercase text-center px-1">Adicionar Mesa</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
