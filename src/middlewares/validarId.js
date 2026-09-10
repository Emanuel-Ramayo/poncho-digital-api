import {crearError} from '../utils/errores.js';

export const validarId = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return next(crearError('El ID del libro debe ser un número entero positivo', 400));
    }

    req.libroId = id;
    next();
};