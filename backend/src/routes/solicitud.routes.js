import { Router } from 'express';
import * as controller from '../controllers/solicitud.controller.js';
import { asyncHandler } from '../middlewares/errors.js';
import { validateSolicitud } from '../middlewares/validateSolicitud.js';

const router = Router();

router.get('/', asyncHandler(controller.listar));
router.post('/', validateSolicitud(), asyncHandler(controller.crear));
router.get('/:id/respuesta', asyncHandler(controller.obtenerRespuesta));
router.get('/:id', asyncHandler(controller.obtener));
router.put('/:id', validateSolicitud({ parcial: true }), asyncHandler(controller.actualizar));
router.delete('/:id', asyncHandler(controller.eliminar));

export default router;
