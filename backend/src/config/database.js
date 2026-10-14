import mongoose from 'mongoose';
import { config } from './index.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isMongoReady = () => mongoose.connection.readyState === 1;

/**
 * Conecta con MongoDB y reintenta hasta lograrlo. No existe respaldo en memoria:
 * si MongoDB no está disponible, la API responde 503 en lugar de perder datos (HU-10).
 */
export const connectMongo = async () => {
  for (;;) {
    try {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[mongo] conectado');
      return;
    } catch (error) {
      console.warn(`[mongo] no disponible (${error.message}). Reintentando en 3s...`);
      await delay(3000);
    }
  }
};
