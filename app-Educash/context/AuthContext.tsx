import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('AuthProvider no montado'); },
  register: async () => { throw new Error('AuthProvider no montado'); },
  logout: async () => { throw new Error('AuthProvider no montado'); },
});

export const useAuth = (): AuthContextType => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('educash_user')
      .then(d => { if (d) setUser(JSON.parse(d)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getUsers = async (): Promise<any[]> => {
    try {
      const d = await AsyncStorage.getItem('educash_users');
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    const users = await getUsers();
    if (users.find((u: any) => u.email === email))
      throw new Error('Este correo ya está registrado');
    const newUser = { id: Date.now().toString(), name, email, password };
    await AsyncStorage.setItem('educash_users', JSON.stringify([...users, newUser]));
    const safe: User = { id: newUser.id, name, email };
    await AsyncStorage.setItem('educash_user', JSON.stringify(safe));
    setUser(safe);
  };

  const login = async (email: string, password: string): Promise<void> => {
    const users = await getUsers();
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (!found) throw new Error('Correo o contraseña incorrectos');
    const safe: User = { id: found.id, name: found.name, email: found.email };
    await AsyncStorage.setItem('educash_user', JSON.stringify(safe));
    setUser(safe);
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem('educash_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};