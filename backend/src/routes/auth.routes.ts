import { Router } from 'express';

// traemos las funciones que manejan la logica de los usuarios
import { registerUser, loginUser } from '../controllers/auth.controller';

// creamos una instancia del enrutador para definir los caminos
const router = Router();

// cuando alguien mande datos a la ruta /register, llamamos a la funcion de registro
router.post('/register', registerUser);

// cuando alguien intente entrar por /login, lo mandamos a la funcion de inicio de sesion
router.post('/login', loginUser);

// exportamos todo el mapa de rutas para que el servidor principal lo pueda usar
export default router;