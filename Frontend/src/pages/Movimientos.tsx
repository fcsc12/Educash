import { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../hooks/useFinance';
import { MainLayout } from '../layouts/MainLayout';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Inbox,
  Edit3,
  X,
  Tag,
  Loader2,
  Calendar
} from 'lucide-react';

export const Movimientos = () => {

  // estados para manejar el usuario de firebase y los modales de edicion
  const [currentUid, setCurrentUid] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // estados para los filtros de la tabla
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // escuchamos cuando el usuario inicia sesion para sacar su id
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUid(user.uid);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // traemos las funciones crud del hook personalizado de finanzas
  const { transactions, deleteTransaction, updateTransaction } = useFinance(currentUid);

  // aqui filtramos la lista segun lo que escriban o el tipo (gasto/ingreso)
  // usamos usememo para que no procese todo cada vez que el componente se renderice por otra cosa

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions
      .filter(t => {
        // buscamos tanto en descripcion como en categoria
        const text = `${t.description} ${t.category}`.toLowerCase();
        const matchesSearch = text.includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesSearch && matchesType;
      })
      
      // ordenamos por fecha para que lo mas nuevo salga arriba
      .sort((a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
  }, [transactions, search, typeFilter]);

  // funcion para mandar la actualizacion a firestore
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTransaction(editingTransaction.id, {
      ...editingTransaction,
      amount: Number(editingTransaction.amount) // nos aseguramos que sea numero
    });
    setIsEditModalOpen(false);
  };

  // formateo rapido para que la primera letra sea mayuscula
  const formatText = (t: string) =>
    t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '';

  // clases de tailwind para el estilo vidrioso (glassmorphism)
  const card = "rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl shadow-sm border border-gray-200 dark:border-white/5";
  const inputStyle = "w-full bg-black/5 dark:bg-white/10 text-sm px-4 py-3 rounded-xl outline-none text-gray-900 dark:text-white border border-transparent focus:border-indigo-500/50 transition-all";

  return (
    <MainLayout title="Movimientos">
      {/* margen negativo para que quede bien pegado arriba como en el dashboard */}
      <div className="max-w-6xl mx-auto pb-24 space-y-6 -mt-2">
        
        {/* cabecera con el titulo */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial de Movimientos</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Gestiona y filtra tus transacciones</p>
        </div>

        {/* barra de busqueda y select de tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descripción o categoría..."
              className={`${inputStyle} pl-11`}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className={`${inputStyle} pl-11 appearance-none cursor-pointer`}
            >
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
        </div>

        {/* contenedor de la lista de movimientos */}
        <div className={`${card} overflow-hidden`}>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {loadingAuth ? (
              // loader por si firebase tarda en responder
              <div className="py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-indigo-500" />
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-black/2 dark:hover:bg-white/2 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {/* circulo con color segun si es entrada o salida */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm
                      ${t.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-rose-500/10 text-rose-600'}
                    `}>
                      {t.type === 'income'
                        ? <ArrowUpRight size={20} />
                        : <ArrowDownLeft size={20} />}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {formatText(t.description)}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          <Tag size={10} className="text-indigo-500/50" />
                          {formatText(t.category)}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {t.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className={`text-sm font-black mr-2 ${
                      t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}
                      ${Number(t.amount).toLocaleString('es-CO')}
                    </p>

                    {/* botones de accion que solo se ven al pasar el mouse (group-hover) */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTransaction(t);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 rounded-xl hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-500 transition-all"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => {
                          if(confirm('¿Eliminar este movimiento?')) deleteTransaction(t.id);
                        }}
                        className="p-2 rounded-xl hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // vista cuando no hay resultados de busqueda
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="text-gray-300 dark:text-white/20" size={32} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No hay movimientos registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* modal flotante para editar la descripcion o monto */}
      {isEditModalOpen && editingTransaction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Editar movimiento</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-2 mb-1 block">Descripción</label>
                <input
                  className={inputStyle}
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-2 mb-1 block">Monto ($)</label>
                <input
                  type="number"
                  className={inputStyle}
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})}
                />
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 mt-2">
                Confirmar Cambios
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};