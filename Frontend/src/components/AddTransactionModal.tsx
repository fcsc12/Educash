import { useState, useEffect } from 'react';
import { ChevronDown, Tag, AlignLeft, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type { Category, NewTransaction } from '../interfaces/types';
import { auth } from '../firebase/firebase';

interface Props {
  onClose: () => void;
  onAdd: (tx: NewTransaction) => void;
}

const categories: Category[] = [
  'Transporte', 'Comida', 'Utilidades', 'Educación',
  'Salud', 'Ocio', 'Recibos', 'Arriendo', 'Compras', 'Otros'
];

export const AddTransactionModal = ({ onClose, onAdd }: Props) => {

  // manejamos los datos del formulario con estados para reaccionar a lo que escribes
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Category>('Comida');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // este efecto sirve para que el modal se sienta como una parte natural del sistema
  useEffect(() => {

    // evitamos que el usuario pueda hacer scroll en el fondo mientras el modal esta activo
    document.body.style.overflow = 'hidden';
    
    // permitimos que el modal se cierre solo con tocar la tecla escape
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    
    return () => {

      // cuando el modal desaparece, devolvemos el scroll a la normalidad
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // funcion para que los numeros tengan puntos de miles mientras vas digitando
  const formatNumber = (value: string) => {
    const rawValue = value.replace(/\D/g, ''); // limpia cualquier caracter que no sea un numero
    return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // inserta los puntos segun la posicion
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatNumber(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // si ya estamos enviando, bloqueamos clicks extras para evitar duplicados

    // convertimos el texto con puntos a un numero real que la base de datos pueda entender
    const numericValue = Number(amount.replace(/\./g, ''));
    
    // validamos que el monto sea un numero valido y mayor a cero antes de procesar
    if (!amount || isNaN(numericValue) || numericValue <= 0) {
      alert("ingresa un monto valido");
      return;
    }

    // verificamos que el usuario este logueado para asociar la transaccion a su cuenta
    const user = auth.currentUser;
    if (!user) return;

    setIsSubmitting(true);
    
    // enviamos el objeto de la transaccion con toda la informacion procesada
    onAdd({
      amount: numericValue,
      type,

      // si es ingreso, forzamos la categoria a 'otros'; si es gasto, mandamos la elegida
      category: type === 'income' ? 'Otros' : category,
      date: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
      
      // si no escriben nada, ponemos un texto por defecto para que no quede vacio
      description: description.trim() || (type === 'income' ? 'ingreso extra' : 'gasto general'),
      userId: user.uid
    });
    
    onClose();
  };

  const inputStyle = "w-full p-4 rounded-xl bg-black/5 dark:bg-white/10 text-sm outline-none text-gray-900 dark:text-white border border-transparent focus:border-indigo-500/50 transition-all";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl p-6 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">nuevo registro</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">educash manager</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* selector para elegir entre gasto o ingreso */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
              type === 'expense' ? 'bg-white dark:bg-[#2c2c2e] text-rose-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDownCircle size={14} /> egreso
            </div>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
              type === 'income' ? 'bg-white dark:bg-[#2c2c2e] text-emerald-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpCircle size={14} /> ingreso
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* campo para el monto de dinero */}
          <div className="relative">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold">monto</label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>$</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                className={`${inputStyle} pl-8 text-lg font-black ${type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                required
              />
            </div>
          </div>

          {/* el selector de categoria solo aparece si es un gasto (egreso) */}
          {type === 'expense' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold items-center gap-1">
                <Tag size={12} className="text-indigo-500" /> categoria
              </label>
              <div className="relative">
                <select
                  className={`${inputStyle} appearance-none pr-10 font-bold cursor-pointer`}
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                >
                  {categories.map(c => (
                    <option key={c} value={c} className="bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          )}

          {/* espacio para que el usuario escriba una descripcion corta */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold items-center gap-1">
              <AlignLeft size={12} className="text-indigo-500" /> concepto
            </label>
            <input
              type="text"
              placeholder="¿en que gastaste?"
              className={inputStyle}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* boton final para confirmar el envio de la informacion */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 mt-2 ${
              type === 'expense'
                ? 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600'
                : 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700'
            } disabled:opacity-50`}
          >
            {isSubmitting ? 'procesando...' : 'confirmar registro'}
          </button>
        </form>
      </div>
    </div>
  );
};