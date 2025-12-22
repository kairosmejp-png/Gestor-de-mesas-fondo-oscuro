
export interface Product {
  id: string;
  quantity: number;
  description: string;
  unitPrice: number;
  delivered: boolean;
}

export interface TablePayments {
  cash: number;
  pix: number;
  debit: number;
  credit: number;
}

export interface Table {
  id: string;
  number: number;
  name: string;
  products: Product[];
  manualServiceFee: number;
  manualTotal: number;
  payments: TablePayments;
  splitCount: number;
}

export interface GlobalTotals {
  totalBilled: number;
  totalServiceFee: number;
  totalCash: number;
  totalPix: number;
  totalDebit: number;
  totalCredit: number;
}
