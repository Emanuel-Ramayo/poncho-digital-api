// src/services/usuariosService.js
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import { crearError } from "../utils/errores.js";

// Cantidad de trabajo que realizará bcrypt
const FACTOR_COSTO = 10;

// Proyección segura para no filtrar nunca passwordHash en lecturas
const selectUsuarioSeguro = {
  id: true,
  nombre: true,
  email: true,
  activo: true,
  createdAt: true,
  updatedAt: true
};

// POST /api/usuarios 
export const registrarUsuario = async (registrarUsuarioDto) => {
  const { nombre, email, password } = registrarUsuarioDto;

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email }
  });

  if (usuarioExistente) {
    throw crearError("Ya existe un usuario con ese email.", 409);
  }

  const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

  return await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      activo: true
    },
    select: selectUsuarioSeguro
  });
};

// POST /api/usuarios/registro-artesano
// Crea cuenta, Artesano y solicitud PENDIENTE en una sola transacción atómica.
// NO se asigna el rol ARTESANO aquí para que la cuenta no opere productos mientras esté pendiente.
export const registrarUsuarioArtesano = async (dto) => {
  const { nombre, email, password, rubro_id, localidad_id, anio_id } = dto;
  const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

  return await prisma.$transaction(async (tx) => {
    // 1. Crear usuario activo pero SIN rol ARTESANO
    const usuario = await tx.usuario.create({
      data: {
        nombre,
        email,
        passwordHash,
        activo: true
      }
    });

    // 2. Crear perfil de Artesano vinculado al usuario recién creado
    const artesano = await tx.artesano.create({
      data: {
        nombre,
        rubro_id,
        localidad_id,
        usuarioId: usuario.id
      }
    });

    // Determinar el año de postulación (usa el provisto o asegura el año en curso)
    let anioIdFinal = anio_id;
    if (!anioIdFinal) {
      const anioActual = new Date().getFullYear();
      const anioRegistro = await tx.anioPostulacion.upsert({
        where: { anio: anioActual },
        update: {},
        create: { anio: anioActual }
      });
      anioIdFinal = anioRegistro.id;
    }

    // 3. Crear la postulación/solicitud en estado PENDIENTE vinculada al artesano
    const postulacion = await tx.postulacion.create({
      data: {
        artesano_id: artesano.id,
        anio_id: anioIdFinal,
        estado: "PENDIENTE"
      }
    });

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      activo: usuario.activo,
      artesano: {
        id: artesano.id,
        rubro_id: artesano.rubro_id,
        localidad_id: artesano.localidad_id
      },
      postulacion: {
        id: postulacion.id,
        anio_id: postulacion.anio_id,
        estado: postulacion.estado
      }
    };
  });
};

// Resolución de postulaciones por parte del ADMINISTRADOR
// Solo admin puede resolver; transición validada en el where (estado: "PENDIENTE"); resolver una solicitud ya resuelta -> 409
export const resolverPostulacion = async (postulacionId, nuevoEstado) => {
  const idNum = Number(postulacionId);

  return await prisma.$transaction(async (tx) => {
    // Transición de estado condicionada en el where (solo si está PENDIENTE)
    const resultado = await tx.postulacion.updateMany({
      where: {
        id: idNum,
        estado: "PENDIENTE"
      },
      data: { estado: nuevoEstado }
    });

    if (resultado.count === 0) {
      const existente = await tx.postulacion.findUnique({
        where: { id: idNum },
        select: { id: true }
      });

      if (!existente) {
        throw crearError("Postulación no encontrada.", 404);
      }

      throw crearError("La solicitud ya ha sido resuelta previamente.", 409);
    }

    const postulacionActualizada = await tx.postulacion.findUnique({
      where: { id: idNum },
      include: {
        artesano: {
          select: { usuarioId: true }
        }
      }
    });

    // Si la solicitud es APROBADA, se le asigna el rol ARTESANO al usuario en la misma transacción
    if (nuevoEstado === "APROBADA") {
      const rolArtesano = await tx.rol.findUnique({
        where: { nombre: "ARTESANO" }
      });

      if (!rolArtesano) {
        throw crearError("El rol ARTESANO no existe en el sistema.", 500);
      }

      const clave = {
        usuarioId: postulacionActualizada.artesano.usuarioId,
        rolId: rolArtesano.id
      };

      await tx.usuarioRol.upsert({
        where: { usuarioId_rolId: clave },
        update: {},
        create: clave
      });
    }

    const { artesano, ...datosPostulacion } = postulacionActualizada;
    return datosPostulacion;
  });
};

// POST /api/usuarios/registro-administrador 
export const registrarAdministrador = async (dto) => {
  const { nombre, email, password } = dto;
  const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

  return await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      activo: true,
      roles: {
        create: {
          rol: { connect: { nombre: "ADMINISTRADOR" } }
        }
      }
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      activo: true
    }
  });
};

// GET /api/usuarios 
export const listarUsuarios = async ({
  nombre,
  email,
  pagina = 1,
  limite = 10,
  ordenPor = "createdAt",
  direccion = "desc"
}) => {
  const where = {};

  if (nombre) {
    where.nombre = { contains: nombre, mode: "insensitive" };
  }

  if (email) {
    where.email = { contains: email, mode: "insensitive" };
  }

  const skip = (Number(pagina) - 1) * Number(limite);

  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      orderBy: { [ordenPor]: direccion },
      skip,
      take: Number(limite),
      select: selectUsuarioSeguro
    }),
    prisma.usuario.count({ where })
  ]);

  return {
    datos: usuarios,
    paginacion: {
      pagina: Number(pagina),
      limite: Number(limite),
      total,
      totalPaginas: Math.ceil(total / Number(limite))
    }
  };
};

// GET /api/usuarios/:id y usado por cargarContextoUsuario (/me)
export const obtenerUsuarioPorId = async (id) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      activo: true,
      roles: {
        select: {
          rol: {
            select: { nombre: true }
          }
        }
      },
      artesano: {
        select: { id: true }
      }
    }
  });

  if (!usuario) return null;

  return {
    ...usuario,
    roles: usuario.roles.map((asignacion) => asignacion.rol.nombre)
  };
};

// PUT /api/usuarios/:id
export const actualizarUsuario = async (id, datosActualizarDto) => {
  const datosParaActualizar = { ...datosActualizarDto };

  if (datosParaActualizar.password) {
    datosParaActualizar.passwordHash = await bcrypt.hash(
      datosParaActualizar.password,
      FACTOR_COSTO
    );
    delete datosParaActualizar.password;
  }

  return await prisma.usuario.update({
    where: { id },
    data: datosParaActualizar,
    select: selectUsuarioSeguro
  });
};

// DELETE /api/usuarios/:id
export const eliminarUsuario = async (id) => {
  return await prisma.usuario.delete({
    where: { id },
    select: { id: true }
  });
};

// Servicio de Login (verifica contraseña y que la cuenta esté activa)
export const iniciarSesion = async (iniciarSesionDto) => {
  const { email, password } = iniciarSesionDto;

  const usuario = await prisma.usuario.findUnique({
    where: { email }
  });

  if (!usuario) {
    throw crearError("Las credenciales son inválidas.", 401);
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

  // Rechaza tanto contraseña incorrecta como cuenta inactiva con el mismo 401
  if (!passwordValida || !usuario.activo) {
    throw crearError("Las credenciales son inválidas.", 401);
  }

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email
  };
};
