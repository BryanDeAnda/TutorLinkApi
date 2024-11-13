import userRouter from '#Routes/user.routes.js';
import express from 'express';
import cors from 'cors'; // Importa cors

const expressApp = express();

// Middleware para CORS
expressApp.use(cors()); // Usa cors para permitir solicitudes desde cualquier origen

// Otros Middlewares
expressApp.use(express.json());

// Rutas
expressApp.use('/user', userRouter);

export default expressApp;
