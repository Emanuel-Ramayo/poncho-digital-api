# Poncho Digital API

API REST desarrollada para el proyecto **Poncho Digital**, orientada a la gestiÃ³n de artesanos, productos, stands, usuarios y postulaciones.

## TecnologÃ­as

- Node.js + Express 5
- PostgreSQL + Prisma 7
- AutenticaciÃ³n JWT
- ValidaciÃ³n con Zod
- Pruebas con `node:test` + Supertest

## InstalaciÃ³n

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

## DocumentaciÃ³n de la API

- [Usuarios](docs/usuarios.md): registro, login, roles, estado de cuenta y `/me`.
- [Postulaciones](docs/postulaciones.md): alta pÃºblica, estados, listado y resoluciÃ³n.

### Endpoints principales

| MÃ³dulo | Base |
| --- | --- |
| Usuarios | `/api/usuarios` |
| Postulaciones | `/api/postulaciones` |
| Artesanos | `/api/artesanos` |
| Productos | `/api/productos` |
| Stands | `/api/stands` |

## Integrantes

- Guillermo Ponessa MU:00266
- Emanuel Ramayo MU:00369
