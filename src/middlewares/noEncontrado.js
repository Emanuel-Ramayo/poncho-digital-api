import { crearError } from '../utils/errores.js';

export const noEncontrado = (req, res, next) => {
    next(crearError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};