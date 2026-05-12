import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MainLayout } from '../layouts/MainLayout';
import { db } from '../firebase/firebase';
import {
  collection, addDoc, query, where, onSnapshot,
  updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import {
  PiggyBank, Wallet, TrendingUp, Trash2, X, Plus
} from 'lucide-react';

export const Metas = () => {

  // sacamos el usuario de nuestro hook de auth para saber de quien son las metas
  const { user } = useAuth();
  const userId = user?.uid;

  // estados para guardar lo que viene de la base de datos y manejar el modal
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', icon: '🎯' });

  // esta funcion ayuda a que los numeros se vean bien con puntos mientras escribes
  const formatNumber = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // para cerrar el modal y limpiar lo que escribimos
  const handleClose = () => {
    setIsModalOpen(false);
    setNewGoal({ title: '', target: '', icon: '🎯' });
  };

  // traemos las transacciones en tiempo real filtrando por el id del usuario
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    const unsub = onSnapshot(q, snap => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [userId]);

  // traemos las metas guardadas en firestore
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'goals'), where('userId', '==', userId));
    const unsub = onSnapshot(q, snap => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [userId]);

  // calculamos cuanto dinero real queda libre para meterle a las metas
  const { savings } = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0);
    return { savings: income - expense };
  }, [transactions]);

  // borrar una meta con el confirm tipico del navegador
  const handleDeleteGoal = async (id: string) => {
    if(confirm('¿Eliminar esta meta?')) await deleteDoc(doc(db, 'goals', id));
  };

  // aqui esta lo bueno: restamos del saldo y sumamos a la meta
  const handleDeposit = async (goal: any) => {
    if (savings <= 0) return alert("Sin saldo disponible");
    const amount = prompt(`¿Cuánto ahorrar en "${goal.title}"?`);
    if (!amount) return;
    const value = Number(amount.replace(/\./g, ''));
    
    // validamos que no intente ahorrar mas de lo que tiene
    if (isNaN(value) || value <= 0 || value > savings) return;

    // actualizamos la meta y creamos un movimiento de gasto para que el saldo baje
    await updateDoc(doc(db, 'goals', goal.id), { current: (goal.current || 0) + value });
    await addDoc(collection(db, 'transactions'), {
      userId, amount: value, category: 'Ahorro', description: `Abono a ${goal.title}`,
      type: 'expense', date: new Date().toISOString().split('T')[0], createdAt: serverTimestamp()
    });
  };

  // para guardar una meta nueva en firestore
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTarget = Number(newGoal.target.replace(/\./g, ''));
    if (!newGoal.title || !cleanTarget || !userId) return;
    await addDoc(collection(db, 'goals'), {
      userId, title: newGoal.title, target: cleanTarget, current: 0, icon: newGoal.icon, createdAt: serverTimestamp()
    });
    handleClose();
  };

  // estilos rapidos para las tarjetas e inputs
  const card = "rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl shadow-sm border border-gray-200 dark:border-white/5 p-5";
  const inputStyle = "w-full p-4 rounded-xl bg-black/5 dark:bg-white/10 text-sm outline-none text-gray-900 dark:text-white border border-transparent focus:border-indigo-500/50 transition-all";

  return (
    <MainLayout title="Metas">
      {/* ajuste de margen superior para consistencia */}
      <div className="max-w-6xl mx-auto pb-24 space-y-6 -mt-2">
        
        {/* cabecera: titulo y boton alineados */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Metas</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ahorra para lo que importa</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Nueva Meta
          </button>
        </div>

        {/* card de saldo: aqui se ve cuanto podemos gastar en las metas */}
        <div className="rounded-3xl p-6 bg-indigo-600 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-100 uppercase tracking-widest opacity-80">
              <Wallet size={14} />
              Saldo disponible para ahorrar
            </div>
            <h2 className="text-4xl font-black mt-2">
              ${savings.toLocaleString('es-CO')}
            </h2>
          </div>
          <TrendingUp className="absolute -right-6 -bottom-6 opacity-10" size={150} />
        </div>

        {/* grid de metas: se ajusta segun el tamaño de pantalla */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            
            // calculamos el porcentaje para la barra de progreso
            const progress = Math.min(((goal.current || 0) / (goal.target || 1)) * 100, 100);
            return (
              <div key={goal.id} className={`${card} group relative transition-all hover:-translate-y-0.5`}>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl shadow-inner">
                    {goal.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white capitalize leading-tight">
                      {goal.title}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">
                      Meta: ${goal.target.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-tight">Acumulado</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
                      ${(goal.current || 0).toLocaleString('es-CO')}
                    </p>
                  </div>
                  {/* boton del cerdito para abonar */}
                  <button
                    onClick={() => handleDeposit(goal)}
                    className="w-10 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform active:scale-90"
                  >
                    <PiggyBank size={20} />
                  </button>
                </div>

                {/* barra de progreso visual */}
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Progreso</p>
                    <p className="text-xs font-black text-indigo-500">{progress.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* modal tipo ios para crear la meta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl p-6 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nueva Meta</h3>
              <button onClick={handleClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold">¿Qué quieres lograr?</label>
                <input
                  className={inputStyle}
                  placeholder="Ej: Viaje a Japón..."
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 ml-2 mb-1 block font-bold">Monto Objetivo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={`${inputStyle} pl-8`}
                    placeholder="0"
                    value={newGoal.target}
                    onChange={e => setNewGoal({ ...newGoal, target: formatNumber(e.target.value) })}
                  />
                </div>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 mt-2">
                Crear Objetivo
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};