# Poncho Digital API

API REST desarrollada para el proyecto **Poncho Digital**, orientada a la gestión de artesanos, productos, stands, usuarios y postulaciones.

## Tecnologías

- Node.js + Express 5
- PostgreSQL + Prisma 7
- Autenticación JWT
- Validación con Zod
- Pruebas con `node:test` + Supertest

## Instalación

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

Configurar las variables de entorno:

```bash
copy .env.example .env
```

Editar `.env` con la URL de PostgreSQL y el secreto JWT. Para iniciar el servidor:

```bash
npm run dev
```

La API queda disponible en `http://localhost:3000` y las rutas empiezan con `/api`.

## Documentación de la API

- [Usuarios](docs/usuarios.md): registro, login, roles, estado de cuenta y `/me`.
- [Postulaciones](docs/postulaciones.md): alta pública, estados, listado y resolución.

### Endpoints principales

| Módulo | Base |
| --- | --- |
| Usuarios | `/api/usuarios` |
| Postulaciones | `/api/postulaciones` |
| Artesanos | `/api/artesanos` |
| Productos | `/api/productos` |
| Stands | `/api/stands` |

## Pruebas

Las pruebas usan una base de datos exclusiva (`NODE_ENV=test`). Nunca apuntan a la base de desarrollo.

### Preparación (una sola vez)

1. Crear la base de pruebas en PostgreSQL:

   ```bash
   createdb mydb_test
   ```

2. Copiar el ejemplo y completar la contraseña:

   ```bash
   copy .env.test.example .env.test
   ```

   El nombre de la base debe contener `test`.

3. Aplicar las migraciones sobre la base de pruebas:

   ```bash
   npm run test:preparar
   ```

### Ejecución

```bash
npm test
```

La suite incluye:

- `tests/humo.test.js`: verifica el entorno de pruebas, la app exportada y los roles base.
- `tests/integration/usuarios.test.js`: registro, login, `/me`, permisos y creación de administradores.
- `tests/integration/postulaciones.test.js`: alta pública, listado, detalle, resolución y borrado.

## Integrantes

- Guillermo Ponessa MU:00266
- Emanuel Ramayo MU:00369
