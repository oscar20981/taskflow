import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errors.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.frontendOrigins, exposedHeaders: ['X-Cache'] }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 2000,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: (req) => req.path === '/api/health',
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
