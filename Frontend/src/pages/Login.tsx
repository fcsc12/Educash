import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const navigate = useNavigate();

  // traemos las funciones de login que definimos en el hook de autenticacion
  const { login, loginWithGoogle } = useAuth();

  // estados para capturar lo que escribe el usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // estilos para los inputs para no repetir codigo en el jsx
  const inputClass =
    "w-full px-4 py-4 rounded-2xl bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-[#242426] text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all duration-200";

  // funcion para el login tradicional con correo y clave
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // para que no se recargue la pagina al enviar el form
    if (loading) return; // si ya esta cargando, no hacemos nada
    if (!email.trim() || !password.trim()) return; // validacion basica de campos vacios

    try {
      setLoading(true);

      // llamamos a la funcion del hook que conecta con firebase
      await login(email.trim(), password);

      // si todo sale bien, lo mandamos al inicio
      navigate('/');
    } catch (error: any) {
      
      // si hay error (clave mal, etc), avisamos con un alert
      alert('error: ' + (error?.message || 'credenciales invalidas'));
    } finally {
      setLoading(false);
    }
  };

  // funcion para entrar rapidito con la cuenta de google
  const handleGoogleLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      alert('error con google: ' + (error?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8f9fa] dark:bg-[#0b0b0c]">
      <div className="w-full max-w-md space-y-8">
        
        {/* el logo de educash con una animacion bacana al pasar el mouse */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 transition-transform hover:scale-105 duration-500">
            <CreditCard className="text-white w-8 h-8" strokeWidth={2} />
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            EduCash
          </h2>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 mt-2">
            control de gastos inteligente
          </p>
        </div>

        {/* el contenedor blanco/oscuro con efecto de desenfoque glassmorphism */}
        <div className="rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl shadow-sm p-8 sm:p-10 border border-gray-200 dark:border-white/5 transition-all">
          
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* campo de correo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-2">
                <Mail size={12} className="text-indigo-500" /> correo electronico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@educash.com"
                className={inputClass}
              />
            </div>

            {/* campo de clave con link para recuperar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Lock size={12} className="text-indigo-500" /> contraseña
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter hover:underline"
                >
                  ¿la olvidaste?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {/* boton principal de entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 group"
            >
              {loading ? 'procesando...' : (
                <>
                  iniciar sesion
                  <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* separador para la opcion de google */}
          <div className="my-8 flex items-center gap-4 px-4 text-gray-300 dark:text-white/10">
            <div className="flex-1 h-[1px] bg-current" />
            <span className="text-[10px] font-black uppercase tracking-widest">o continua con</span>
            <div className="flex-1 h-[1px] bg-current" />
          </div>

          {/* boton de google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white dark:bg-[#242426] text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-white active:scale-[0.98] transition-all border border-gray-200 dark:border-white/5 shadow-sm hover:bg-gray-50 dark:hover:bg-[#2c2c2e]"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.3 30.4 0 24 0 14.6 0 6.4 5.5 2.6 13.5l7.8 6C12.4 13 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.6-.2-3.2-.5-4.7H24v9.2h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.9 37 46.5 31 46.5 24z"/>
              <path fill="#FBBC05" d="M10.4 28.1c-1-3-1-6.2 0-9.2l-7.8-6C.9 16.2 0 20 0 24s.9 7.8 2.6 11.1l7.8-6z"/>
              <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-3.5-13.6-8.5l-7.8 6C6.4 42.5 14.6 48 24 48z"/>
            </svg>
            google
          </button>

          {/* link por si no tienes cuenta todavia */}
          <div className="text-center mt-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              ¿no tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-indigo-600 dark:text-indigo-400 font-black ml-1 hover:underline active:opacity-70 transition-opacity"
              >
                registrate ahora
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};