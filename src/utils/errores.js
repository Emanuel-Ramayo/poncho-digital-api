export const crearError = (mensaje, status) => {
    const error = new Error(mensaje);
    error.status = status;
    return error;
}