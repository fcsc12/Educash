import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Mail, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export const ForgotPassword = () => {

  // isSent nos sirve para cambiar la interfaz una vez el correo sale
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputClass =
    "w-full px-4 py-4 rounded-2xl bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-[#242426] text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all duration-200";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    try {
      setLoading(true);

      // Firebase se encarga de todo el proceso de envio del correo de reset
      await sendPasswordResetEmail(auth, email.trim());

      // Si todo bien, mostramos la pantalla de exito
      setIsSent(true);
    } catch (error: any) {
      alert('error al enviar correo: ' + (error?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8f9fa] dark:bg-[#0b0b0c]">
      <div className="w-full max-w-md space-y-8">

        {/* logo y titulo */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 transition-transform hover:scale-105 duration-500">
            <CreditCard className="text-white w-8 h-8" strokeWidth={2} />
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            EduCash
          </h2>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 mt-2">
            recuperar acceso
          </p>
        </div>

        {/* tarjeta principal con condicional: o el form o el mensaje de exito */}
        <div className="rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl shadow-sm p-8 sm:p-10 border border-gray-200 dark:border-white/5 transition-all">

          {!isSent ? (

            // FORMULARIO INICIAL
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-2">
                  <Mail size={12} className="text-indigo-500" /> correo de recuperación
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@educash.com"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 group"
              >
                {loading ? 'enviando...' : (
                  <>
                    enviar enlace
                    <Send size={16} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            
            // VISTA DE EXITO AL ENVIAR
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-500 w-10 h-10" strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  correo enviado
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-4">
                  hemos enviado las instrucciones a: <br />
                  <span className="text-indigo-500 font-bold">{email}</span>
                </p>
              </div>

              <button
                onClick={() => setIsSent(false)}
                className="text-[10px] text-indigo-500 font-black uppercase tracking-widest hover:underline"
              >
                ¿no recibiste nada? reintentar
              </button>
            </div>
          )}
        </div>

        {/* boton para devolvernos al login */}
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-500 flex items-center gap-2 mx-auto transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            volver al inicio
          </button>
        </div>

      </div>
    </div>
  );
};