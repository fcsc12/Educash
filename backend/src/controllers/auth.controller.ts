import { Request, Response } from 'express';

// importamos la configuracion de firebase que ya habiamos dejado lista
import { auth } from '../config/firebase';

// usamos "async" para avisarle a node que aqui adentro habra tareas que toman tiempo
export const registerUser = async (req: Request, res: Response) => {
  try {

    // sacamos el correo y la clave que el usuario escribio en el frontend
    const { email, password } = req.body;

    // "await" hace que el codigo se detenga un momento hasta que firebase termine de crear el usuario
    const user = await auth.createUser({
      email,
      password,
    });

    // si todo salio bien, le mandamos los datos del usuario creado como respuesta
    res.json(user);
  } catch (error: any) {

    // si firebase nos dice que algo fallo, atrapamos el error y avisamos que hubo un problema
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {

  // aqui solo avisamos que la validacion de entrada ocurre directamente en el cliente
  res.json({
    message: "login se maneja en frontend con firebase auth"
  });
};