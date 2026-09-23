export const crearError = (mensaje, status, detalles = null) => {

    const error = new Error(mensaje);

    error.status = status;
    error.detalles = detalles;

    return error;
};

export const detallarErroresZod = (errorZod) =>
    errorZod.issues.map((issue) => ({
        campo: issue.path.join(".") || null,
        mensaje: issue.message
    }));