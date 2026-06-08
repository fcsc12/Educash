import { useSupervivencia as useSupervivenciaCtx } from '@/context/SupervivenciaContext';

export const useSupervivencia = () => {
  return useSupervivenciaCtx();
};