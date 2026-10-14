import { Router } from 'express';
import * as monitor from '../controllers/monitor.controller.js';
import { asyncHandler } from '../middlewares/errors.js';
import { requireDependencies } from '../middlewares/dependencies.js';
import solicitudRoutes from './solicitud.routes.js';

const router = Router();

router.get('/health', monitor.health);
router.get('/monitor', asyncHandler(monitor.monitor));
router.get('/estadisticas', requireDependencies, asyncHandler(monitor.stats));
router.use('/solicitudes', requireDependencies, solicitudRoutes);

export default router;
