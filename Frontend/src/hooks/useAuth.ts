// se guio con la ia y busquedas en google para hacer

import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithRedirect, 
  GoogleAuthProvider
} from 'firebase/auth';
import type { User } from 'firebase/auth';

import { auth } from '../firebase/config';

export const useAuth = () => {

  // el estado 'user' guarda toda la info del usuario (nombre, email, id) o null si no hay nadie
  const [user, setUser] = useState<User | null>(null);
  
  // 'loading' sirve para que la app no intente cargar datos antes de saber si hay sesion
  const [loading, setLoading] = useState(true);

  // este efecto es un "vigilante" que corre una sola vez al cargar la app
  useEffect(() => {
    // onAuthStateChanged escucha en tiempo real si el usuario entra o sale
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

      setUser(currentUser); // actualizamos el estado con el usuario actual
      setLoading(false);    // una vez que Firebase responde, dejamos de mostrar "cargando"
    });

    // limpiamos el vigilante cuando el componente se destruye para evitar fugas de memoria
    return () => unsubscribe();
  }, []);

  // funcion para iniciar sesion con credenciales tradicionales
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {

      // mostramos solo el codigo del error para que sea mas facil de depurar
      console.error('login error:', error?.code);
      throw error;
    }
  };

  // funcion para crear una cuenta nueva por primera vez
  const register = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('register error:', error?.code);
      throw error;
    }
  };

  // login con google optimizado para desarrollo local y dispositivos moviles
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // 'signInWithRedirect' es mas estable que 'signInWithPopup' en navegadores moviles
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('google login error:', error?.message);
      throw error;
    }
  };

  // funcion para cerrar la sesion actual
  const logout = async () => {
    try {
      await signOut(auth);
      
      // al hacer signOut, el 'onAuthStateChanged' de arriba se activara y pondra el usuario en null
    } catch (error: any) {
      console.error('logout error:', error?.message);
    }
  };

  return {
    user,
    isAuthenticated: !!user, // convierte el objeto user en un simple verdadero/falso
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };
};