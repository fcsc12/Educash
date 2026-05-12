import {
  Car, Utensils, Lightbulb, GraduationCap, HeartPulse,
  Gamepad2, Receipt, Home, ShoppingCart, MoreHorizontal, Banknote,
  Inbox
} from 'lucide-react';
import type { Transaction } from '../interfaces';

// definimos el tipo para los iconos de Lucide
type IconType = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

// este mapa asocia cada nombre de categoria con un componente de icono especifico
const iconMap: Record<string, IconType> = {
  Transporte: Car,
  Comida: Utensils,
  Utilidades: Lightbulb,
  Educación: GraduationCap,
  Salud: HeartPulse,
  Ocio: Gamepad2,
  Recibos: Receipt,
  Arriendo: Home,
  Compras: ShoppingCart,
  Otros: MoreHorizontal
};

interface Props {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: Props) => {

  // creamos una copia de la lista y la ordenamos por fecha (de mas reciente a mas antigua)
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // estilo base para cada fila, imitando el diseño limpio de los ajustes de iOS
  const cellStyle = 
    "flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all active:scale-[0.98]";

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5">
        {sorted.map((t) => {
          const isIncome = t.type === 'income';
          
          // seleccionamos el icono: si es ingreso usamos billete, si es gasto buscamos en el mapa
          const Icon: IconType = isIncome
            ? Banknote
            : (iconMap[t.category] || MoreHorizontal);

          return (
            <div key={t.id} className={cellStyle}>
              <div className="flex items-center gap-4 min-w-0">

                {/* circulo de color de fondo suave segun el tipo de transaccion */}
                <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${
                  isIncome
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-rose-500/10 text-rose-600'
                }`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-tight truncate">
                    {isIncome ? 'Ingreso Recibido' : t.category}
                  </p>
                  <p className="text-[11px] font-bold text-gray-400 truncate mt-0.5 opacity-80 uppercase tracking-tight">
                    {t.description || 'Sin descripción'}
                  </p>
                </div>
              </div>

              {/* monetario y fecha */}
              <div className="text-right shrink-0">
                <p className={`text-sm font-black tracking-tight ${
                  isIncome ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {isIncome ? '+' : '-'}${Number(t.amount).toLocaleString('es-CO')}
                </p>
                <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase mt-1 tracking-widest">
                  {t.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* se muestra solo cuando no hay datos en el array */}
      {transactions.length === 0 && (
        <div className="py-20 text-center rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 bg-black/1 dark:bg-white/1">
          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Inbox className="text-gray-300 dark:text-white/10" size={32} />
          </div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            bandeja vacia
          </h3>
          <p className="text-[10px] text-indigo-500/50 mt-1 font-bold uppercase tracking-widest">
            no hay registros recientes
          </p>
        </div>
      )}
    </div>
  );
};