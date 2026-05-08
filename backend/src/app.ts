import express from 'express';
import cors from 'cors';

// traemos los grupos de rutas que definimos antes
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';

const app = express();

// esto permite que aplicaciones de afuera se conecten a nuestra api
app.use(cors());

// sirve para que el servidor entienda cuando le enviamos informacion en formato json
app.use(express.json());

// aqui le decimos al servidor que use las rutas de autenticacion bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);

// y las de transacciones bajo el prefijo /api/transactions
app.use('/api/transactions', transactionRoutes);

export default app;