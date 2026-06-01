import { ArrowUpCircle, ArrowDownCircle, LayoutGrid } from 'lucide-react';

// definimos los tres estados posibles para nuestra lista
type FilterType = 'all' | 'income' | 'expense';

interface CategoryGridProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const CategoryGrid = ({ activeFilter, onFilterChange }: CategoryGridProps) => {

  // estilos base para que todos los botones se vean iguales de tamaño y forma
  const baseBtn = 
    "flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl transition-all duration-200 active:scale-95 border";

  // estilo para cuando un boton no esta seleccionado
  const inactive = 
    "bg-transparent border-transparent text-gray-400 dark:text-gray-500 hover:bg-black/5 dark:hover:bg-white/5";

  return (
    <div className="w-full">
      {/* encabezado visual para organizar la seccion */}
      <div className="flex items-center gap-2 mb-4 ml-1">
        <div className="w-1 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-white/30">
          filtrar transacciones
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        
        {/* boton para mostrar absolutamente todo */}
        <button
          onClick={() => onFilterChange('all')}
          className={`${baseBtn} ${
            activeFilter === 'all'
              ? 'bg-white dark:bg-[#2c2c2e] text-indigo-600 dark:text-indigo-400 border-gray-200 dark:border-white/10 shadow-sm'
              : inactive
          }`}
        >
          <div className={`${activeFilter === 'all' ? 'text-indigo-500' : ''}`}>
            <LayoutGrid size={18} strokeWidth={activeFilter === 'all' ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider">todos</span>
        </button>

        {/* boton para filtrar solo el dinero que entra */}
        <button
          onClick={() => onFilterChange('income')}
          className={`${baseBtn} ${
            activeFilter === 'income'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5'
              : inactive
          }`}
        >
          <ArrowUpCircle size={18} strokeWidth={activeFilter === 'income' ? 2.5 : 2} />
          <span className="text-[10px] font-black uppercase tracking-wider">ingresos</span>
        </button>

        {/* boton para filtrar solo el dinero que sale */}
        <button
          onClick={() => onFilterChange('expense')}
          className={`${baseBtn} ${
            activeFilter === 'expense'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-sm shadow-rose-500/5'
              : inactive
          }`}
        >
          <ArrowDownCircle size={18} strokeWidth={activeFilter === 'expense' ? 2.5 : 2} />
          <span className="text-[10px] font-black uppercase tracking-wider">gastos</span>
        </button>
      </div>
    </div>
  );
};