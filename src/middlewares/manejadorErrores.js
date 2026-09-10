export const manejadorErrores = (err, req, res, next) => {
    const status = err.status || 500;

    if ( status >= 500 ) {
        console.error(err);
        return res.status(status).json({ error: 'Error interno del servidor' });
    }

    res.status(status).json({ error: err.message });
}