// diseño extraido de la pagina de https://tailwindcss.com/
import { useMemo } from 'react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';
import { MainLayout } from '../layouts/MainLayout';
import {
  AlertTriangle,
  Activity,
  Zap,
  Calendar,
  Flame,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export const Analisis = () => {

  // traemos al usuario para saber de quien son los datos
  const { user } = useAuth();
  const userId = user?.uid || '';
  
  // sacamos las transacciones y la funcion del reporte que ya hicimos en el otro hook
  const { transactions, getMonthlyReport } = useFinance(userId);

  // el reporte para tener los totales a la mano
  const report = getMonthlyReport ? getMonthlyReport() : { totalExpense: 0, totalIncome: 0 };
  const totalExpense = report.totalExpense || 0;

  // aqui agrupamos los gastos por categoria para la grafica de barras

  // usamos usememo para que no se recalcule a cada rato si nada ha cambiado
  const categoryData = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense') // solo nos interesan los gastos
      .reduce((acc: { name: string; value: number }[], t) => {
        const existing = acc.find(i => i.name === t.category);
        if (existing) existing.value += Number(t.amount); // si la categoria ya esta, sumamos el valor
        else acc.push({ name: t.category, value: Number(t.amount) }); // si no, la creamos
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value); // lo ordenamos de mayor a menor gasto
  }, [transactions]);

  // esta logica es para saber que dia de la semana gastas mas (el punto critico)
  const peakDay = useMemo(() => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const counts: Record<number, number> = {};

    transactions.filter(t => t.type === 'expense').forEach(t => {
      const day = new Date(t.date).getDay(); // sacamos el numero del dia (0-6)
      counts[day] = (counts[day] || 0) + Number(t.amount);
    });

    if (!Object.keys(counts).length) return '---';

    // buscamos el dia que tenga la suma de dinero mas alta
    const maxDay = Object.keys(counts)
      .reduce((a, b) => (counts[Number(a)] > counts[Number(b)] ? a : b), "0");

    return days[Number(maxDay)];
  }, [transactions]);

  // estilos rapidos para las tarjetas
  const card = "rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl shadow-sm p-5 border border-gray-200 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-[#242426]";

  // una funcioncita para poner la primera letra en mayuscula y que se vea pro
  const formatText = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';

  // definimos las estadisticas principales que van arriba
  const stats = [
    {
      label: 'Burn rate', // que tanto dinero estas "quemando"
      v: `$${totalExpense.toLocaleString('es-CO')}`,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      label: 'Mayor fuga', // la categoria donde mas se te va la plata
      v: categoryData[0]?.name || '---',
      icon: AlertTriangle,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      label: 'Punto critico', // el dia mas peligroso para tu billetera
      v: peakDay,
      icon: Calendar,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10'
    }
  ];

  return (
    <MainLayout title="Analisis">
      <div className="max-w-6xl mx-auto pb-24 space-y-6 -mt-2">
        
        {/* titulo de la pagina */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analisis Financiero</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Patrones y sugerencias inteligentes</p>
        </div>

        {/* mostramos las 3 tarjetas de arriba (burn rate, fuga, etc) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className={card}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                    {formatText(stat.v)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* seccion de barras de progreso por categoria */}
          <div className={`lg:col-span-8 ${card}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                  Flujo de gastos por categoria
                </h3>
                <p className="text-[10px] text-gray-400 font-medium">Distribucion del gasto mensual</p>
              </div>
              <Activity className="text-indigo-500 opacity-50" size={20} />
            </div>

            <div className="space-y-7">
              {categoryData.length > 0 ? categoryData.map((item) => {
                // calculamos el porcentaje de cada gasto respecto al total
                const perc = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
                const isCritical = perc > 30; // si gastas mas del 30% en una sola cosa, se pone rojo

                return (
                  <div key={item.name} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {formatText(item.name)}
                        </span>
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                          ${item.value.toLocaleString('es-CO')}
                        </p>
                      </div>
                      <span className={`text-xs font-black ${isCritical ? 'text-rose-500' : 'text-indigo-500'}`}>
                        {perc.toFixed(0)}%
                      </span>
                    </div>

                    {/* barrita de progreso visual */}
                    <div className="h-2 w-full bg-gray-200/50 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isCritical ? 'bg-rose-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                
                // si no hay datos, mostramos un dibujo vacio
                <div className="py-20 text-center">
                  <BrainCircuit className="mx-auto text-gray-300 dark:text-white/10" size={48} />
                  <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
                    Sin datos para analizar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* sidebar con el score y los consejos */}
          <div className="lg:col-span-4 space-y-6">

            {/* tarjeta del score (la nota que te saca la app) */}
            <div className="rounded-3xl p-6 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Zap size={20} className="fill-white" />
                  </div>
                  <div className="bg-white/15 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em]">
                    Score
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Salud Financiera</p>
                <p className="text-6xl font-black mt-1">
                  {/* si gastas menos del 70% de lo que ganas, sacas buena nota */}
                  {totalExpense < (report.totalIncome * 0.7) ? 'A+' : 'C-'}
                </p>
                <p className="text-xs mt-6 opacity-90 leading-relaxed font-medium">
                  {totalExpense < (report.totalIncome * 0.7) 
                    ? '¡Excelente! Estas ahorrando mas del 30% de tus ingresos.' 
                    : 'Tus gastos estan por encima del limite saludable del 70%.'}
                </p>
              </div>
              {/* icono de fondo gigante para que se vea mas estetico */}
              <TrendingUp className="absolute -right-6 -bottom-6 opacity-10" size={160} />
            </div>

            {/* consejo basado en el dia que mas gastas */}
            <div className={card}>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                Estrategia sugerida
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Detectamos que los <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formatText(peakDay)}</span> suelen tener mayor volumen de gastos.
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <p className="text-[10px] uppercase font-black text-indigo-500 mb-1.5 tracking-tighter">Tip de optimizacion</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Establece una alerta de consumo para los {peakDay} o intenta mover tus compras grandes a mitad de semana para equilibrar el flujo.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};