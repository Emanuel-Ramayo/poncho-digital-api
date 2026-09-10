import express from 'express';
import postulacionesRoutes from './routes/postulacionesRoutes.js';
import standsRoutes from './routes/standsRoutes.js';
import productosRoutes from './routes/productosRoutes.js';
import artesanosRoutes from './routes/artesanosRoutes.js';
import { logger } from './middlewares/logger.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';
import { noEncontrado } from './middlewares/noEncontrado.js';

const app = express();
app.use(logger); //Middleware para registrar las solicitudes entrantes
app.use(express.json());
const PORT =  3000;
app.get('/', (req, res) => {
    res.send('Bienvenido a la API REST de Poncho digital');
});
app.use("/api/postulaciones", postulacionesRoutes);
app.use("/api/stands", standsRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/artesanos", artesanosRoutes);
app.use(manejadorErrores);  //Middleware para manejar errores
app.use(noEncontrado); //Middleware para manejar rutas no encontradas
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});