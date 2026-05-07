export type Category =
  | 'Transporte'
  | 'Comida'
  | 'Utilidades'
  | 'Educación'
  | 'Salud'
  | 'Ocio'
  | 'Recibos'
  | 'Arriendo'
  | 'Compras'
  | 'Otros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
  userId: string;
}

export interface MonthlyReport {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  percentageSaved: number;
}

export interface NewTransaction {
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
  description: string;
  userId: string;
}