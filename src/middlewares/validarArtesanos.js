import {
    artesanoSchema,
    consultarArtesanosSchema
} from "../validators/artesanosValidator.js";

import {
    crearError,
    detallarErroresZod
} from "../utils/errores.js";

// Valida los datos enviados en POST y PUT
export const validarArtesano = (req, res, next) => {
    const resultado = artesanoSchema.safeParse(req.body);

    console.log("Resultado de la validación:", resultado);

    if (!resultado.success) {
        const detalles = detallarErroresZod(resultado.error);

        return next(
            crearError(
                "Datos de artesano inválidos",
                400,
                detalles
            )
        );
    }

    req.body = resultado.data;
    next();
};

// Valida los parámetros de consulta de GET /artesanos
export const validarConsultaArtesanos = (req, res, next) => {
    const resultado = consultarArtesanosSchema.safeParse(req.query);

    console.log("Resultado de la validación:", resultado);

    if (!resultado.success) {
        const detalles = detallarErroresZod(resultado.error);

        return next(
            crearError(
                "Parámetros de consulta inválidos",
                400,
                detalles
            )
        );
    }

    req.queryValidada = resultado.data;
    next();
};

