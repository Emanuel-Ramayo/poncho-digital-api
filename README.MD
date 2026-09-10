# Poncho Digital API

API REST desarrollada para el proyecto **Poncho Digital**, orientado a la gestión de artesanos, productos, stands y postulaciones.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

## Endpoints disponibles

### Artesanos

* `GET /artesanos` → Lista todos los artesanos.
* `GET /artesanos/:id` → Obtiene un artesano por su ID.

### Productos

* `GET /productos` → Lista todos los productos.
* `GET /productos/:id` → Obtiene un producto por su ID.

### Stands

* `GET /stands` → Lista todos los stands.
* `GET /stands/:id` → Obtiene un stand por su ID.

### Postulaciones

* `GET /postulaciones` → Lista todas las postulaciones.
* `GET /postulaciones/:id` → Obtiene una postulación por su ID.

> En esta etapa los datos se almacenan en memoria mediante arrays. Las operaciones de creación, modificación y eliminación se incorporarán en etapas posteriores.

## Integrantes

* Guillermo Ponessa MU:00266
* Emanuel Ramayo MU:00369
