import { Request, Response } from 'express';

// traemos la conexion a firestore que configuramos antes
import { db } from '../config/firebase';

const COLLECTION = 'transactions';

// definimos el molde de como debe verse una transaccion en nuestro sistema
interface Transaction {
  userId: string;
  type: string;
  amount: number;
  category: string;
  description?: string;
}

// funcion para crear un nuevo registro de dinero
export const createTransaction = async (
  req: Request<{}, {}, Transaction>,
  res: Response
) => {
  try {
    const data = req.body;

    // guardamos los datos y le sumamos la fecha de creacion automatica
    const doc = await db.collection(COLLECTION).add({
      ...data,
      createdAt: new Date(),
    });

    // devolvemos el id que firestore le asigno al nuevo documento
    res.json({ id: doc.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// funcion para traer todos los movimientos de un usuario especifico
export const getTransactions = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    
    // sacamos el id del usuario de la url
    const { userId } = req.params;

    // consultamos la base de datos filtrando por ese usuario
    const snapshot = await db
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get();

    // convertimos esa lista de documentos en un arreglo de objetos facil de leer
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// funcion para quitar una transaccion usando su id
export const deleteTransaction = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    // buscamos el documento exacto y le damos la orden de borrar
    await db.collection(COLLECTION).doc(id).delete();

    res.json({ message: 'deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};