export type Category = 'Transporte' | 'Comida' | 'Utilidades' | 'Educación' | 'Salud' | 'Ocio' | 'Recibos' | 'Arriendo' | 'Compras' | 'Otros';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
  description: string;
}

export interface MonthlyReport {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  percentageSaved: number;
}