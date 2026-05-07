import { useState, useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { MainLayout } from '../layouts/MainLayout';
import { CategoryGrid } from '../components/CategoryGrid';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { AddButton } from '../components/AddButton';
import { BalanceCard } from '../components/BalanceCard';

import {
  TrendingUp,
  AlertCircle,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export const Dashboard = () => {
  // traemos al usuario y sus finanzas usando los hooks que ya armamos
  const { user } = useAuth();
  const finance = useFinance(user?.uid ?? '');

  // estados para controlar el modal de agregar y los filtros (todos, ingresos, gastos)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const txs = finance?.transactions || [];

  // aqui calculamos los totales de ingresos, gastos y lo que nos queda (ahorro)
  // el usememo evita que se recalculen si no han cambiado las transacciones
  const { totalIncome, totalExpense, savings } = useMemo(() => {
    const income = txs
      .filter(t => t.type === 'income')
      .reduce((a, b) => a + Number(b.amount || 0), 0);

    const expense = txs
      .filter(t => t.type === 'expense')
      .reduce((a, b) => a + Number(b.amount || 0), 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      savings: income - expense
    };
  }, [txs]);

  // porcentaje de ahorro para ver que tan juiciosos somos
  const percentageSaved = totalIncome
    ? Math.max(Math.round((savings / totalIncome) * 100), 0)
    : 0;

  // filtramos y ordenamos para mostrar solo los 10 movimientos mas recientes
  const latestTransactions = useMemo(() => {
    return [...txs]
      .filter(t =>
        filter === 'all'
          ? true
          : String(t.type).toLowerCase() === filter
      )
      .sort((a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      )
      .slice(0, 10);
  }, [txs, filter]);

  // calculamos que porcentaje de lo que ganamos se nos va en gastos
  const expensePercentage = totalIncome
    ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100)
    : totalExpense ? 100 : 0;

  // si gastamos mas del 80% de lo que entra, se prenden las alarmas
  const isCritical = expensePercentage > 80;

  const card =
    "rounded-2xl bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl shadow-sm border border-gray-200 dark:border-white/5";

  const formatText = (t: string) =>
    t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '';

  return (
    <MainLayout title="Resumen">

      <div className="max-w-6xl mx-auto pb-24 space-y-6 -mt-2">

        {/* titulo de bienvenida */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resumen General
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Control y analisis de tus finanzas
          </p>
        </div>

        {/* tarjeta grande con el balance total (ahorro, ingresos y gastos) */}
        <BalanceCard
          report={{
            savings,
            totalIncome,
            totalExpense,
            percentageSaved
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* columna izquierda: filtros de categoria y salud financiera */}
          <div className="lg:col-span-5 space-y-6">

            <section className={`${card} p-5`}>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Categorias y filtros
              </h3>

              <CategoryGrid
                activeFilter={filter}
                onFilterChange={setFilter}
              />
            </section>

            {/* tarjeta de salud: cambia a rojo si estas gastando mucho */}
            <div className={`rounded-xl p-7 text-white relative overflow-hidden shadow-lg transition-all
              ${isCritical 
                ? 'bg-gradient-to-br from-rose-500 to-rose-600' 
                : 'bg-gradient-to-br from-indigo-600 to-violet-700'
              }`}>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                    {isCritical ? <AlertCircle size={20} /> : <TrendingUp size={20} />}
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase opacity-90">
                    Salud financiera
                  </span>
                </div>

                <div className="flex items-baseline gap-1">
                  <p className="text-5xl font-black mb-1">{expensePercentage}%</p>
                </div>
                
                <p className="text-sm font-medium opacity-80 capitalize">
                  {isCritical ? 'Gastos muy elevados' : 'Tu balance es optimo'}
                </p>
              </div>

              {/* dibujo de fondo para que se vea mas bacano */}
              <PieChart className="absolute -right-8 -bottom-8 opacity-10 rotate-12" size={180} />
            </div>

          </div>

          {/* columna derecha: lista detallada de los ultimos movimientos */}
          <div className="lg:col-span-7">

            <div className={`${card} overflow-hidden`}>

              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Ultimos movimientos
                </h3>

                <span className="text-xs px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-300">
                  {latestTransactions.length} de 10
                </span>
              </div>

              {/* lista de transacciones con iconos de flechas segun el tipo */}
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {latestTransactions.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">

                      {/* verde si entra plata, rojo si sale */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${t.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'}
                      `}>
                        {t.type === 'income'
                          ? <ArrowUpRight size={18} />
                          : <ArrowDownLeft size={18} />}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatText(t.description)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatText(t.category)} • {t.date}
                        </p>
                      </div>

                    </div>

                    {/* precio formateado a moneda colombiana */}
                    <p className={`text-sm font-bold ${
                      t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}
                      ${Number(t.amount).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* boton flotante para añadir un gasto rapido */}
      <AddButton onClick={() => setIsModalOpen(true)} />

      {/* modal que aparece para escribir los datos de la transaccion */}
      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onAdd={(tx) => {
            if (!user?.uid || !finance.addTransaction) return;

            finance.addTransaction({
              ...tx,
              amount: Number(tx.amount),
              userId: user.uid,
              date: tx.date || new Date().toISOString().split('T')[0]
            });

            setIsModalOpen(false);
          }}
        />
      )}

    </MainLayout>
  );
};