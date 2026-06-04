// diseño extraido de la pagina de https://tailwindcss.com/

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, PieChart, Target,
  CreditCard, LogOut, User as UserIcon, Loader2
} from 'lucide-react';

import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition
} from '@headlessui/react';

import { Fragment, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Props {
  children: React.ReactNode; // aquí se renderiza el contenido de cada página
  title: string;
}

interface UserData {
  name: string;
  email: string;
  photo?: string;
}

export const MainLayout = ({ children }: Props) => {
  const location = useLocation(); // para saber en qué página estamos (activar botones)
  const navigate = useNavigate(); // para redireccionar si el usuario no está logueado
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<UserData>({
    name: "Usuario",
    email: "",
    photo: ""
  });

  // apenas carga el layout, verificamos si hay una sesión activa de Firebase
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // si hay usuario, llenamos el estado con sus datos reales
        setUser({
          name: firebaseUser.displayName || "Usuario",
          email: firebaseUser.email || "",
          photo: firebaseUser.photoURL || ""
        });
        setLoading(false);
      } else {
        // si no hay usuario, lo expulsamos al login inmediatamente
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // lista centralizada de navegación para no repetir código
  const navigation = [
    { name: 'Inicio', href: '/', icon: LayoutDashboard },
    { name: 'Movimientos', href: '/movimientos', icon: Wallet },
    { name: 'Análisis', href: '/analisis', icon: PieChart },
    { name: 'Metas', href: '/metas', icon: Target },
  ];

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut();
    navigate('/login');
  };

  // mientras Firebase responde, mostramos un spinner para que la app no se vea "rota"
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0b0b0c] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // variables de estilo para mantener el código limpio y fácil de cambiar
  const navItem = "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95";
  const active = "bg-black/5 dark:bg-white/10 text-indigo-500 shadow-sm";
  const inactive = "text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10 hover:text-indigo-500";
  const card = "bg-white/80 dark:bg-[#1c1c1e]/80 border border-gray-200 dark:border-white/5 backdrop-blur-md";

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0b0b0c] text-gray-900 dark:text-white font-[Inter]">

      <Disclosure as="nav" className={`${card} sticky top-0 z-[60] shadow-sm`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Logo con animación al pasar el mouse */}
          <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-all">
              <CreditCard size={16} className="text-white" />
            </div>
            <span className="text-sm font-black tracking-tight uppercase">EduCash</span>
          </Link>

          {/* Menú de navegación horizontal para PC */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${navItem} ${location.pathname === item.href ? active : inactive}`}
              >
                <item.icon size={14} />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Menú desplegable del perfil de usuario */}
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center transition-transform active:scale-90">
              <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all">
                <img
                  className="w-full h-full object-cover"
                  src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff`}
                  alt="avatar"
                />
              </div>
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition duration-150 ease-out"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition duration-100 ease-in"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <MenuItems className="bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 absolute right-0 mt-2 w-52 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-[70]">
                {/* Cabecera del menú con info del usuario */}
                <div className="px-3 py-3 border-b border-gray-100 dark:border-white/5 mb-1">
                  <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500">cuenta</p>
                  <p className="text-xs font-bold truncate mt-0.5">{user.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/30 truncate uppercase">{user.email}</p>
                </div>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/perfil')}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-white/60 hover:bg-black/5'
                      }`}
                    >
                      <UserIcon size={14} /> perfil
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 transition-all mt-1 ${
                        active ? 'bg-red-500/10' : 'hover:bg-red-500/5'
                      }`}
                    >
                      <LogOut size={14} /> salir
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </Disclosure>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </main>

      {/* BARRA DE NAVEGACIÓN MÓVIL (Estilo isla flotante) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[320px] z-[60]">
        <div className="bg-white/80 dark:bg-[#1c1c1e]/80 border border-white/20 h-16 rounded-[1rem] flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`p-3 rounded-2xl transition-all active:scale-75 ${
                  isActive ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30' : 'text-gray-400'
                }`}
              >
                <item.icon size={20} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};