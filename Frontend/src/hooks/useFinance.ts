import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export const useFinance = (userId: string) => {

  // almacenamos la lista de movimientos y el estado de carga
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // este efecto mantiene tu app actualizada sin necesidad de recargar la pagina
  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      return;
    }

    // creamos una consulta filtrada: solo datos del usuario actual y ordenados por fecha
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    // onSnapshot es un "socket" que escucha cambios en la base de datos
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({

        id: doc.id, // extraemos el id unico del documento de Firestore
        ...doc.data() // esparcimos el contenido del registro
        
      }));
      setTransactions(data);
      setLoading(false);
    });

    // al destruir el componente, cortamos la conexion con la base de datos
    return () => unsubscribe();
  }, [userId]);

  // creacion de registros
  const addTransaction = async (data: any) => {
    try {
      const transactionData = {
        ...data,
        userId,

        // si no viene fecha, usamos la fecha actual del sistema (YYYY-MM-DD)
        date: data.date || new Date().toISOString().split('T')[0], 
        createdAt: new Date().toISOString() // marca de tiempo para control interno
      };
      await addDoc(collection(db, 'transactions'), transactionData);
    } catch (error) {
      console.error("error al añadir transaccion:", error);
    }
  };

  // actualizcion
  const updateTransaction = async (id: string, data: any) => {
    try {

      // referenciamos el documento especifico por su ID
      const docRef = doc(db, 'transactions', id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("error al actualizar:", error);
    }
  };

  // eliminacion
  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error("error al eliminar:", error);
    }
  };


  // esta funcion procesa los datos que ya tenemos en memoria para sacar totales
  const getMonthlyReport = () => {
    
    // obtenemos el año y mes actual para filtrar (ejemplo: "2024-05")
    const currentMonth = new Date().toISOString().slice(0, 7);

    // filtramos solo los movimientos del mes en curso
    const monthlyData = transactions.filter(t => t.date && t.date.startsWith(currentMonth));

    // sumamos ingresos por un lado y gastos por otro usando .reduce()
    const totalIncome = monthlyData
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const totalExpense = monthlyData
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    return {
      totalIncome,
      totalExpense,
      savings: totalIncome - totalExpense // balance final
    };
  };

  // exponemos las herramientas para que cualquier componente (Dashboard, Listas) las use
  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyReport 
  };
};