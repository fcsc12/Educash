// se hizo este boton debido a que la barra del dashboard no debaja barle click en el modo de celular

import { Plus } from 'lucide-react';

// accion al hacer clic
interface AddButtonProps {
  onClick: () => void;
}

export const AddButton = ({ onClick }: AddButtonProps) => {
  return (
    <button
      onClick={onClick}
      aria-label="agregar movimiento"

      // posicion fija, animaciones de escala y transiciones suaves
      className="fixed bottom-28 right-6 z-60 active:scale-90 hover:scale-105 transition-all duration-300 group"
      type="button"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-black/10 dark:bg-white/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative w-16 h-16 bg-[#1c1c1e] dark:bg-white text-white dark:text-black rounded-3xl flex items-center justify-center shadow-2xl border border-white/10 dark:border-transparent">
          <Plus 
            size={28} 
            strokeWidth={3} 
            className="group-hover:rotate-180 transition-transform duration-700 ease-in-out" 
          />
        </div>
      </div>
    </button>
  );
};