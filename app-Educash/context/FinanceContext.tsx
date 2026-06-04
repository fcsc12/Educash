import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export type Category =
  | 'Transporte' | 'Comida' | 'Utilidades' | 'Educación'
  | 'Salud' | 'Ocio' | 'Recibos' | 'Arriendo' | 'Compras' | 'Otros';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: Category;
  date: string;
  description: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  emoji: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  totalIncome: number;
  totalExpense: number;
  savings: number;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, 'id' | 'current'>) => Promise<void>;
  depositToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const FinanceContext = createContext<FinanceContextType>({
  transactions: [],
  goals: [],
  totalIncome: 0,
  totalExpense: 0,
  savings: 0,
  addTransaction: async () => {},
  deleteTransaction: async () => {},
  addGoal: async () => {},
  depositToGoal: async () => {},
  deleteGoal: async () => {},
});

export const useFinance = (): FinanceContextType => useContext(FinanceContext);

export const FinanceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const txKey = `tx_${user?.id}`;
  const gKey  = `goals_${user?.id}`;

  useEffect(() => {
    if (!user) { setTransactions([]); setGoals([]); return; }
    AsyncStorage.getItem(txKey).then(d => { if (d) setTransactions(JSON.parse(d)); });
    AsyncStorage.getItem(gKey).then(d => { if (d) setGoals(JSON.parse(d)); });
  }, [user]);

  const saveTx = async (data: Transaction[]) => {
    setTransactions(data);
    await AsyncStorage.setItem(txKey, JSON.stringify(data));
  };

  const saveGoals = async (data: Goal[]) => {
    setGoals(data);
    await AsyncStorage.setItem(gKey, JSON.stringify(data));
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>): Promise<void> =>
    saveTx([{ ...t, id: Date.now().toString() }, ...transactions]);

  const deleteTransaction = async (id: string): Promise<void> =>
    saveTx(transactions.filter((t: Transaction) => t.id !== id));

  const addGoal = async (g: Omit<Goal, 'id' | 'current'>): Promise<void> =>
    saveGoals([...goals, { ...g, id: Date.now().toString(), current: 0 }]);

  const deleteGoal = async (id: string): Promise<void> =>
    saveGoals(goals.filter((g: Goal) => g.id !== id));

  const depositToGoal = async (goalId: string, amount: number): Promise<void> => {
    const updated = goals.map((g: Goal) =>
      g.id === goalId ? { ...g, current: g.current + amount } : g
    );
    await saveGoals(updated);
    await addTransaction({
      amount,
      type: 'expense',
      category: 'Otros',
      description: `Abono a ${goals.find((g: Goal) => g.id === goalId)?.title ?? ''}`,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const totalIncome  = transactions.reduce((a: number, t: Transaction) =>
    t.type === 'income'  ? a + t.amount : a, 0);
  const totalExpense = transactions.reduce((a: number, t: Transaction) =>
    t.type === 'expense' ? a + t.amount : a, 0);
  const savings = totalIncome - totalExpense;

  return (
    <FinanceContext.Provider value={{
      transactions, goals, totalIncome, totalExpense, savings,
      addTransaction, deleteTransaction, addGoal, depositToGoal, deleteGoal,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};