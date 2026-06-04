import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth'; 
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword'; 
import { Movimientos } from './pages/Movimientos';
import { Analisis } from './pages/Analisis';
import { Metas } from './pages/Metas';
import { ProfileView } from './pages/ProfileView';
import { JSX } from 'react';

// componente para proteger rutas privadas (solo accesibles si estas logueado)
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  // pantalla de carga mientras firebase verifica si hay una sesion activa
  if (loading) return <div className="flex h-screen items-center justify-center">Cargando EduCash...</div>;
  
  // si no hay usuario detectado, redirigimos al login de una
  return user ? children : <Navigate to="/login" />;
};

// componente para rutas publicas (impide entrar a login/register si ya estas logueado)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // si el usuario ya inicio sesion, lo mandamos directo al dashboard
  return user ? <Navigate to="/" /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* grupo de rutas publicas: auth y recuperacion */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        
        {/* grupo de rutas privadas: core de la aplicacion educash */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/movimientos" element={<PrivateRoute><Movimientos /></PrivateRoute>} />
        <Route path="/analisis" element={<PrivateRoute><Analisis /></PrivateRoute>} />
        <Route path="/metas" element={<PrivateRoute><Metas /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><ProfileView /></PrivateRoute>} />

        {/* wildcard para manejar cualquier ruta no definida, manda al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;