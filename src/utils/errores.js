export const crearError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
}

export const detallarErroresZod = (errorZod) =>
    errorZod.issues.map((issue) => ({
        campo: issue.path.join('.') || null,
        mensaje: issue.message
    }));