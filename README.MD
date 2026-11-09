# Poncho Digital API

Proyecto de **Desarrollo Backend — FTyCA, UNCa** (Tecnicatura Universitaria en Diseño de Software, **Grupo 3**).

API REST para la gestión de **artesanos, productos, stands, usuarios y postulaciones** de Poncho Digital. Incluye autenticación JWT con revocación de tokens, roles `ADMINISTRADOR` y `ARTESANO`, CRUD de artesanos/productos/stands, registro y resolución de postulaciones, documentación OpenAPI con Swagger UI y pruebas automáticas. Las operaciones siguen el flujo **rutas → validación → controladores → servicios**.

## Tecnologías

- Node.js 24.x + Express 5
- PostgreSQL + Prisma 7 (con `@prisma/adapter-pg`)
- Autenticación JWT y hash de contraseñas con `bcrypt`
- Validación con Zod 4
- Documentación con `swagger-autogen` y Swagger UI
- Pruebas con `node:test` y Supertest

## Instalación e inicio

Requisitos: **Node.js 24.x** y **PostgreSQL iniciado**. Ejecutar los comandos desde la raíz del proyecto.

1. Instalar las dependencias:

   ```bash
   npm install
   ```

2. Crear la base de desarrollo desde PostgreSQL:

   ```sql
   CREATE DATABASE mydb;
   ```

   `mydb` es el nombre usado en `.env.example`; se puede cambiar siempre que se actualice `DATABASE_URL`.

3. Copiar `.env.example` como `.env` y configurar la conexión y el secreto JWT:

   ```bash
   copy .env.example .env
   ```

   En Linux/macOS: `cp .env.example .env`.

   ```env
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/mydb?schema=public"
   JWT_SECRET="REEMPLAZAR_POR_UN_SECRETO_PROPIO"
   JWT_EXPIRES_IN="15m"
   PORT=3000

   ADMIN_NOMBRE="Admin Poncho"
   ADMIN_EMAIL="admin@ponchodigital.com"
   ADMIN_PASSWORD="AdminPassword2026!"
   ```

4. Aplicar las migraciones, generar Prisma Client y la documentación, e iniciar:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   npm run docs
   npm run dev
   ```

   La API queda disponible en **http://localhost:3000** (o el puerto configurado en `PORT`). Para iniciar sin observar cambios, usar `npm start`.

   La aplicación lee `swagger-output.json` al iniciar. Si el archivo no existe, ejecutar `npm run docs` antes de `npm run dev`.

### Primer administrador

Las migraciones cargan los roles `ARTESANO` y `ADMINISTRADOR`, pero no crean cuentas. Para crear el primer administrador, completar `ADMIN_NOMBRE`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env` y ejecutar **una sola vez para esa cuenta**:

```bash
node src/scripts/inicializarAdmin.js
```

### Datos de catálogo

Además de los roles, las tablas de catálogo (`Rubro`, `Provincia`, `Localidad`, `Categoria`, `Pabellon`, `Sector` y `AnioPostulacion`) deben tener registros antes de usar los endpoints que las referencian. Por ejemplo, `POST /api/usuarios/registro-artesano` necesita `rubro_id` y `localidad_id`, y `POST /api/postulaciones` necesita `artesano_id` y `anio_id`. Se pueden cargar con SQL o con `npx prisma studio`.

## Documentación de la API

Abrir **http://localhost:3000/docs** (también disponible en **http://localhost:3000/api/docs**). Swagger UI permite consultar las operaciones y enviar solicitudes reales con **Try it out**.

- El listado de artesanos, productos y stands es público; el detalle de productos y stands también. El detalle de un artesano requiere rol `ADMINISTRADOR`.
- El registro de usuarios/artesanos y el alta pública de postulaciones no requieren token.
- Las operaciones de administración requieren una cuenta activa con rol `ADMINISTRADOR`.
- Los productos propios requieren rol `ARTESANO`; cada artesano opera únicamente sus productos.
- Para operaciones protegidas, iniciar sesión y pegar el token en **Authorize**. El encabezado esperado es `Authorization: Bearer <token>`.
- `POST /api/usuarios/logout` revoca el token actual. Los `jti` revocados se guardan hasta su vencimiento y se limpian periódicamente.

Las estructuras reutilizables están en `src/documentacion/esquemas.js`; los comentarios de las rutas describen cada operación. `generar-docs.js` combina esa información y escribe `swagger-output.json`.

Después de modificar esquemas o comentarios:

```bash
npm run docs
```

Reiniciar la API y recargar `/docs`. No editar el JSON generado a mano.

### Documentación por módulo

- [Usuarios](docs/usuarios.md): registro, login, roles, estado de cuenta y `/me`.
- [Postulaciones](docs/postulaciones.md): alta pública, estados, listado y resolución.
- [Optimización de consultas](optimizacion.md): análisis de `select` vs. `include` y benchmark reproducible.

### Roles

| Rol | Alcance |
| --- | --- |
| `ADMINISTRADOR` | Gestiona usuarios, roles, estado de cuentas, artesanos, stands y postulaciones. |
| `ARTESANO` | Se asigna al aprobar una postulación. Opera sus propios productos y consulta su perfil. |
| Sin rol | Usuario recién registrado: solo puede consultar `/api/usuarios/me` y cerrar sesión. |

### Endpoints principales

| Módulo | Base | Acceso |
| --- | --- | --- |
| Usuarios | `/api/usuarios` | Registro y login públicos; `/me` y `/logout` autenticados; administración de roles y estado con `ADMINISTRADOR`. |
| Postulaciones | `/api/postulaciones` | Alta pública; listado, detalle, modificación, resolución y borrado con `ADMINISTRADOR`. |
| Artesanos | `/api/artesanos` | Listado público; `/me` con `ARTESANO`; detalle y CRUD con `ADMINISTRADOR`. |
| Productos | `/api/productos` | Listado y detalle públicos; `/mis-productos` y CRUD propio con `ARTESANO`. |
| Stands | `/api/stands` | Listado y detalle públicos; CRUD con `ADMINISTRADOR`. |

> El alta pública de postulaciones crea una solicitud para un artesano ya existente. El registro público de un artesano (`POST /api/usuarios/registro-artesano`) crea la cuenta, el perfil y una postulación `PENDIENTE` en una sola transacción. El rol `ARTESANO` se asigna al aprobar la postulación.

## Pruebas automáticas

| Comando | Qué comprueba |
| --- | --- |
| `npm run test:schemas` | Validadores Zod de artesanos, productos y stands, sin consultas a PostgreSQL. |
| `npm run test:integracion` | Pruebas HTTP con Supertest y PostgreSQL: productos, usuarios y postulaciones. |
| `npm run test:optimizacion` | Benchmark de `include` vs. `select` sobre la base de desarrollo (ver `optimizacion.md`). |
| `npm test` | Todos los archivos de prueba del proyecto: humo, esquemas e integración. |

**No hace falta iniciar la API con `npm run dev` para ejecutar las pruebas.**

### Preparar la base de pruebas

Crear una base exclusiva en PostgreSQL:

```sql
CREATE DATABASE poncho_digital_test;
```

Copiar `.env.test.example` como `.env.test` y completar la contraseña. Mantener `NODE_ENV=test` y una base cuyo nombre **termine en `_test`**, separada de la base de desarrollo.

```bash
copy .env.test.example .env.test
npm run test:preparar
```

`test:preparar` (alias de `db:test:preparar`) aplica las migraciones sobre la base de pruebas. Ejecutarlo la primera vez y cuando haya nuevas migraciones.

**Las pruebas de integración limpian los datos de la base de pruebas antes de cada caso.** No apuntar `.env.test` a la base de desarrollo.

Para ejecutar todo:

```bash
npm test
```

La suite incluye:

- `tests/humo.test.js`: verifica el entorno de pruebas, la app exportada y los roles base.
- `tests/artesanos-schema.test.js`, `tests/productos-schema.test.js` y `tests/stands-schema.test.js`: validación de esquemas Zod.
- `tests/productos-integracion.test.js`: permisos y CRUD de productos propios, incluyendo la separación entre artesanos.
- `tests/integration/usuarios.test.js`: registro, login, `/me`, permisos y creación de administradores.
- `tests/integration/postulaciones.test.js`: alta pública, listado, detalle, resolución y borrado.

## Estructura del proyecto

```text
src/
  config/          Configuración de entorno, JWT y Prisma
  controllers/     Controladores HTTP
  documentacion/   Esquemas reutilizables de OpenAPI
  middlewares/     Autenticación, autorización, validación y errores
  routes/          Definición de endpoints y comentarios Swagger
  services/        Acceso a datos y reglas de negocio
  validators/      Esquemas de validación con Zod
  scripts/         Admin inicial, preparación de BD de prueba y benchmark
  tareas/          Limpieza periódica de tokens revocados
prisma/            Esquema y migraciones
tests/             Pruebas de humo, esquemas, integración y helpers
docs/              Documentación por módulo
```

Archivos de configuración relevantes:

- `prisma7.config.ts`: configuración de Prisma CLI (schema, migraciones y datasource).
- `generar-docs.js`: genera `swagger-output.json` a partir de las rutas y esquemas.
- `optimizacion.md`: informe de optimización de consultas con Prisma.
- `.env.example` y `.env.test.example`: plantillas de variables de entorno.

## Archivos del repositorio

Versionar el código, `prisma/schema.prisma`, `prisma/migrations/`, las pruebas, `package.json`, `package-lock.json`, `generar-docs.js`, `swagger-output.json` actualizado y la carpeta `docs/`. El JSON generado permite iniciar la API sin regenerar previamente la documentación.

Las plantillas `.env.example` y `.env.test.example` se comparten sin credenciales reales. No subir `.env`, `.env.test`, `node_modules/`, Prisma Client generado ni archivos temporales; respetar `.gitignore`.

## Integrantes

- Guillermo Ponessa MU:00266
- Emanuel Ramayo MU:00369
