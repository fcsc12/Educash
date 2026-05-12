import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import {
  User, Mail, Camera, Save, Lock,
  Heart, Rocket, CheckCircle2, ShieldCheck,
  Loader2
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import {
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

export const ProfileView = () => {
  
  // referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user: fbUser } = useAuth();

  // preparamos los datos del usuario para que no den problemas si son nulos
  const user = fbUser
    ? {
        ...fbUser,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
        avatar: fbUser.photoURL
      }
    : null;

  // siempre que entramos a la vista, subimos al inicio de la pagina
  useEffect(() => window.scrollTo(0, 0), []);

  // estado local para el formulario de edicion
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // cargamos el nombre actual cuando el usuario este disponible
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user?.name]);

  // estilos consistentes con el resto de la app (vidrioso)
  const card = "rounded-2xl bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 shadow-sm";
  const inputStyle = "w-full bg-black/5 dark:bg-white/10 text-sm px-4 py-3 rounded-xl outline-none text-gray-900 dark:text-white border border-transparent focus:border-indigo-500/50 transition-all placeholder:text-gray-400 font-medium";

  // dispara el selector de archivos al darle clic a la foto
  const handlePhotoClick = () => fileInputRef.current?.click();

  // funcion para subir la imagen a firebase storage
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fbUser) return;

    try {
      const storage = getStorage();
      // guardamos la foto con el uid del usuario para que no se repitan
      const imageRef = ref(storage, `profileImages/${fbUser.uid}`);
      await uploadBytes(imageRef, file);
      // sacamos la url publica y actualizamos el perfil de firebase auth
      const url = await getDownloadURL(imageRef);
      await updateProfile(fbUser, { photoURL: url });
    } catch {
      alert('Error al subir imagen');
    }
  };

  // maneja la actualizacion de nombre y el cambio de contraseña
  const handleSaveChanges = async () => {
    if (!fbUser) return;
    setIsSaving(true);

    try {
      // solo actualizamos el nombre si cambio
      if (formData.name !== fbUser.displayName) {
        await updateProfile(fbUser, { displayName: formData.name });
      }

      // para cambiar contraseña en firebase toca reautenticar primero
      if (formData.newPassword && formData.currentPassword) {
        const credential = EmailAuthProvider.credential(
          fbUser.email!,
          formData.currentPassword
        );
        await reauthenticateWithCredential(fbUser, credential);
        await updatePassword(fbUser, formData.newPassword);
      }

      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      // manejo basico de error si la clave actual esta mal
      alert(err.code === 'auth/wrong-password' ? 'Contraseña incorrecta' : 'Error al actualizar');
    }
    setIsSaving(false);
  };

  const formatText = (t: string) =>
    t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '';

  return (
    <MainLayout title="Perfil">
      <div className="max-w-6xl mx-auto pb-24 space-y-6 -mt-2">
        
        {/* seccion de encabezado */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Personaliza tu identidad en EduCash</p>
        </div>

        {/* card principal con la foto y el correo */}
        <div className={card}>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group" onClick={handlePhotoClick}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-inner bg-gray-100 dark:bg-white/5 border-4 border-white dark:border-[#1c1c1e]">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=4f46e5&color=fff`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* overlay que sale al pasar el mouse por la foto */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-3xl cursor-pointer backdrop-blur-[2px]">
                <Camera className="text-white w-6 h-6" />
              </div>
              <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {formatText(user?.name || '')}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-2">
                <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Mail size={14} className="text-indigo-500" />
                  {user?.email}
                </p>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Cuenta Activa
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* formularios de configuracion */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* campos para el nombre y correo (el correo es de solo lectura) */}
            <div className={card}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">Datos Personales</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Información básica de tu cuenta</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Nombre Completo</label>
                  <input
                    className={inputStyle}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Correo Electrónico</label>
                  <input
                    className={`${inputStyle} bg-gray-100 dark:bg-white/5 opacity-50 cursor-not-allowed`}
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* seccion para cambiar la contraseña */}
            <div className={card}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">Seguridad</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Actualiza tu contraseña de acceso</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Contraseña Actual</label>
                   <input
                    type="password"
                    placeholder="••••••••"
                    className={inputStyle}
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Nueva Contraseña</label>
                   <input
                    type="password"
                    placeholder="Mín. 6 caracteres"
                    className={inputStyle}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
              </div>

              {/* boton de guardado con estado de carga */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>

          {/* sidebar con informacion del proyecto educash */}
          <div className="lg:col-span-4 space-y-6">
            <div className={card}>
              <div className="flex items-center gap-3 mb-4">
                <Rocket size={18} className="text-purple-500" />
                <h4 className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">Misión</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Empoderar a estudiantes en su gestión financiera diaria mediante herramientas digitales intuitivas.
              </p>
            </div>

            <div className="rounded-3xl p-7 bg-indigo-600 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
              <Heart size={80} className="absolute -right-6 -bottom-6 opacity-10" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Sobre Nosotros</p>
                <h4 className="text-xl font-black mb-3">EduCash Project</h4>
                <p className="text-sm opacity-90 leading-relaxed font-medium">
                  Una iniciativa universitaria diseñada para mejorar la educación financiera desde el primer semestre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};