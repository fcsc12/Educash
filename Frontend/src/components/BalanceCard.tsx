// fue creado para encapsular la logica de presentacion del resumen financiero en un solo modulo reutilizable

import { Wallet, TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import type { MonthlyReport } from "../interfaces";

interface BalanceCardProps {
  report?: MonthlyReport;
}

export const BalanceCard = ({ report }: BalanceCardProps) => {
  const safeNumber = (value?: number) => {
    return typeof value === "number" && !isNaN(value) ? value : 0;
  };

  const savings = safeNumber(report?.savings);
  const income = safeNumber(report?.totalIncome);
  const expense = safeNumber(report?.totalExpense);

  // Estilo unificado de tarjeta EduCash
  const cardStyle = "rounded-3xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 shadow-sm";
console.log("BalanceCard renderizando");
  return (
    
    <div className={cardStyle}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-[0.15em] text-gray-500 dark:text-gray-400">
              Balance Total
            </p>
            <p className="text-xs font-bold text-gray-400 dark:text-white/30">
              Estado de cuenta actual
            </p>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 transition-colors">
            <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Balance Principal */}
      <div className="mb-8">
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
          ${savings.toLocaleString('es-CO')}
        </h2>
        <div className="flex items-center gap-2 mt-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Patrimonio Disponible
            </p>
        </div>
      </div>

      {/* Stats Detalladas */}
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
        
        {/* Ingresos */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp size={14} />
            </div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ingresos
            </span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-white pl-1">
            ${income.toLocaleString('es-CO')}
          </p>
        </div>

        {/* Gastos */}
        <div className="space-y-1 border-l border-gray-100 dark:border-white/5 pl-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
            
              <TrendingDown size={14} />
            </div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Gastos
            </span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-white pl-1">
            ${expense.toLocaleString('es-CO')}
          </p>
        </div>

      </div>
    </div>
  );
};