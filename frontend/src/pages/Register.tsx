import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Mail, User, Lock, ArrowRight, Hash, RefreshCcw } from 'lucide-react';
import { GoogleAuthProvider, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [timer, setTimer] = useState(0); // Para reenvío de código

  const inputClass = "w-full px-4 py-4 rounded-2xl bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-[#242426] text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-all duration-200";

  // Manejar contador para reenvío
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateAndSendCode = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    // Simulación de envío (Aquí integrarías EmailJS o tu Backend)
    console.log(`%c CÓDIGO DE VERIFICACIÓN PARA ${formData.email}: ${code} `, 'background: #4f46e5; color: #fff; padding: 5px; border-radius: 5px;');
    
    // Simulamos un pequeño delay de red
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      await generateAndSendCode();
      setShowOtpStep(true);
      setTimer(60); // 60 segundos para poder reenviar
    } catch (error) {
      alert("Error al enviar el código. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (userOtp !== generatedOtp) {
      alert("El código ingresado es incorrecto o ha expirado.");
      return;
    }

    try {
      setLoading(true);
      await register(formData.email.trim(), formData.password);
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name
        });
      }
      navigate('/dashboard'); // O a la ruta que prefieras
    } catch (error: any) {
      alert("Error en el registro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8f9fa] dark:bg-[#0b0b0c]">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6">
            <CreditCard className="text-white w-8 h-8" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">EduCash</h2>
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 mt-2">Gestión inteligente de finanzas</p>
        </div>

        <div className="rounded-3xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl shadow-sm p-8 border border-gray-200 dark:border-white/5">
          
          {!showOtpStep ? (
            /* PASO 1: REGISTRO */
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                  <User size={12} className="text-indigo-500" /> Nombre Completo
                </label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Jymmy Fabian" className={inputClass} required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                  <Mail size={12} className="text-indigo-500" /> Correo Electrónico
                </label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="usuario@educash.com" className={inputClass} required />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                  <Lock size={12} className="text-indigo-500" /> Contraseña
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Crea una contraseña" className={inputClass} required />
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirma tu contraseña" className={inputClass} required />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-4 group"
              >
                {loading ? 'Enviando código...' : (
                  <> Continuar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /> </>
                )}
              </button>
            </form>
          ) : (
            /* PASO 2: VERIFICACIÓN OTP */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Verifica tu email</h3>
                <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold leading-relaxed">
                  Hemos enviado un código a <br/>
                  <span className="text-indigo-500">{formData.email}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                  <Hash size={12} className="text-indigo-500" /> Código de 6 dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="· · · · · ·"
                  className={`${inputClass} text-center text-2xl tracking-[0.5em] placeholder:tracking-normal`}
                  autoFocus
                />
              </div>

              <button
                onClick={handleVerifyAndRegister}
                disabled={loading || userOtp.length < 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {loading ? 'Validando...' : 'Finalizar Registro'}
              </button>

              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => timer === 0 && generateAndSendCode()}
                  disabled={timer > 0}
                  className="text-[10px] text-gray-400 font-black uppercase tracking-widest hover:text-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={12} className={timer > 0 ? "animate-spin" : ""} />
                  {timer > 0 ? `Reenviar en ${timer}s` : "Reenviar código"}
                </button>
                
                <button 
                  onClick={() => setShowOtpStep(false)}
                  className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:underline"
                >
                  Volver a editar mis datos
                </button>
              </div>
            </div>
          )}

          {/* Divisor */}
          {!showOtpStep && (
            <>
              <div className="my-8 flex items-center gap-4 px-4 text-gray-300 dark:text-white/10">
                <div className="flex-1 h-[1px] bg-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">O</span>
                <div className="flex-1 h-[1px] bg-current" />
              </div>

              <button
                onClick={() => {/* Lógica Google */}}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white dark:bg-[#242426] text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-white border border-gray-200 dark:border-white/5 hover:bg-gray-50 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="w-4 h-4" alt="Google" />
                Registrarse con Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};