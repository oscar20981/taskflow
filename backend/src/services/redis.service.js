import { createClient } from 'redis';
import { config, REDIS_KEYS } from '../config/index.js';

let client = null;
let subscriber = null;

export const getRedis = () => client;
export const isRedisReady = () => Boolean(client?.isReady);

/**
 * Conecta con Redis (usa el nombre de servicio de Docker Compose en REDIS_URL) y
 * se suscribe al canal con el que el Worker informa los cambios de estado.
 * La reconexión es automática si Redis se reinicia.
 */
export const connectRedis = async (onUpdate) => {
  const options = {
    url: config.redisUrl,
    socket: { reconnectStrategy: (retries) => Math.min(retries * 200, 3000) },
  };

  client = createClient(options);
  client.on('error', (error) => console.error('[redis]', error.message));
  client.on('ready', () => console.log('[redis] conectado'));

  subscriber = client.duplicate();
  subscriber.on('error', (error) => console.error('[redis:sub]', error.message));

  await client.connect();
  await subscriber.connect();
  await subscriber.subscribe(REDIS_KEYS.updatesChannel, (message) => {
    try {
      onUpdate(JSON.parse(message));
    } catch (error) {
      console.error('[redis:sub] mensaje inválido', error.message);
    }
  });
};

export const disconnectRedis = async () => {
  await Promise.allSettled([client?.quit(), subscriber?.quit()]);
};
