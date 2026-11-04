// src/app.js
import "./config/entorno.js"; // carga .env o .env.test según NODE_ENV
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

// Indica si estamos en modo de pruebas (Supertest levanta la app por su cuenta)
const esTest = process.env.NODE_ENV === 'test';

export const app = express();

// Registra cada solicitud en consola (se omite en tests para no ensuciar la salida)
if (!esTest) {
    app.use(logger);
}
app.use(express.json());

// Puerto configurable por variable de entorno (por defecto 3000)
const PORT = process.env.PORT || 3000;

// Ruta de bienvenida
app.get('/', (req, res) => {
    // #swagger.ignore = true
    res.send('Bienvenido a la API REST de Poncho digital');
});

// Documentación Swagger generada con npm run docs (disponible en /docs y /api/docs)
const swaggerDocument = JSON.parse(
    readFileSync(new URL("../swagger-output.json", import.meta.url), "utf8"),
);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/postulaciones", postulacionesRoutes);
app.use("/api/stands", standsRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/artesanos", artesanosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use(noEncontrado); // Middleware para manejar rutas no encontradas
app.use(manejadorErrores); // Middleware para manejar errores

// En modo test NO se abre el puerto ni se inicia la limpieza periódica:
// Supertest recibe la app exportada y la usa directamente.
if (!esTest) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        iniciarLimpiezaRevocaciones();
    });
}

// Se exporta la app (nombrada y por defecto) para poder probarla con Supertest
export default app;
