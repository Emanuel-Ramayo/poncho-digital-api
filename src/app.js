import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';
import postulacionesRoutes from './routes/postulacionesRoutes.js';
import standsRoutes from './routes/standsRoutes.js';
import productosRoutes from './routes/productosRoutes.js';
import artesanosRoutes from './routes/artesanosRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import { logger } from './middlewares/logger.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';
import { noEncontrado } from './middlewares/noEncontrado.js';
import './config/jwt.js';
import { iniciarLimpiezaRevocaciones } from './tareas/limpiezaRevocaciones.js';

const app = express();
app.use(logger); //Middleware para registrar las solicitudes entrantes
app.use(express.json());
const PORT =  3000;
app.get('/', (req, res) => {
    // #swagger.ignore = true
    res.send('Bienvenido a la API REST de Poncho digital');
});

const swaggerDocument = JSON.parse(
    readFileSync(new URL("../swagger-output.json", import.meta.url), "utf8"),
);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/postulaciones", postulacionesRoutes);
app.use("/api/stands", standsRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/artesanos", artesanosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use(noEncontrado); //Middleware para manejar rutas no encontradas
app.use(manejadorErrores);  //Middleware para manejar errores
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    iniciarLimpiezaRevocaciones();
});
