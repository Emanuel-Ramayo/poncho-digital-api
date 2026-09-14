import {crearError} from '../utils/errores.js';

export const validarId = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return next(crearError('El ID debe ser un número entero positivo', 400));
    }

    req.id = id;
    next();
};