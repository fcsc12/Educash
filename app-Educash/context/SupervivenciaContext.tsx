import React, { createContext, useContext, useState } from 'react';
import { useFinance } from './FinanceContext'; 

interface SupervivenciaEstado {
  activo: boolean;
  montoInicial: number;
  duracionDias: number;
  fechaInicio: string;
}

interface SupervivenciaContextType {
  estado: SupervivenciaEstado & { saldoRestante: number };
  activarModo: (monto: number, dias: number) => void;
  desactivarModo: () => void;
  obtenerTopeDiario: () => number;
}

const SupervivenciaContext = createContext<SupervivenciaContextType | undefined>(undefined);

export function SupervivenciaProvider({ children }: { children: React.ReactNode }) {
  const { transactions } = useFinance();
  
  const [config, setConfig] = useState<SupervivenciaEstado>({
    activo: false,
    montoInicial: 0,
    duracionDias: 0,
    fechaInicio: '',
  });

  const totalGastadoDesdeInicio = config.activo
    ? transactions
        .filter(t => t.type === 'expense' && t.date >= config.fechaInicio)
        .reduce((sum, t) => sum + t.amount, 0)
    : 0;

  const saldoRestante = config.activo 
    ? Math.max(0, config.montoInicial - totalGastadoDesdeInicio) 
    : 0;

  const activarModo = (monto: number, dias: number) => {
    const hoyStr = new Date().toISOString().split('T')[0];
    setConfig({
      activo: true,
      montoInicial: monto,
      duracionDias: dias,
      fechaInicio: hoyStr,
    });
  };

  const desactivarModo = () => {
    setConfig({
      activo: false,
      montoInicial: 0,
      duracionDias: 0,
      fechaInicio: '',
    });
  };

  const obtenerTopeDiario = () => {
    if (!config.activo || config.duracionDias <= 0) return 0;
    return config.montoInicial / config.duracionDias;
  };

  return (
    <SupervivenciaContext.Provider value={{ estado: { ...config, saldoRestante }, activarModo, desactivarModo, obtenerTopeDiario }}>
      {children}
    </SupervivenciaContext.Provider>
  );
}

export function useSupervivencia() {
  const context = useContext(SupervivenciaContext);
  if (!context) throw new Error('useSupervivencia debe usarse dentro de un SupervivenciaProvider');
  return context;
}