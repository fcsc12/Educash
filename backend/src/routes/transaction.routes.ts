import { Router } from 'express';

// importamos las funciones que creamos para manejar la base de datos
import {
  createTransaction,
  getTransactions,
  deleteTransaction,
} from '../controllers/transaction.controller';

const router = Router();

// ruta para crear una transaccion
router.post('/', createTransaction);

// ruta para obtener las transacciones de un usuario usando su id
router.get('/:userId', getTransactions);

// ruta para borrar una transaccion especifica usando su identificador
router.delete('/:id', deleteTransaction);

// exportamos el mapa de rutas para conectarlo al servidor principal
export default router;