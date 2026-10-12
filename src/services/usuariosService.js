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
  createdAt: true,
  updatedAt: true
};

// POST /api/usuarios (o registro)
export const registrarUsuario = async (registrarUsuarioDto) => {
  const { nombre, email, password } = registrarUsuarioDto;

  // Busca si ya existe un usuario con ese email
  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email }
  });

  if (usuarioExistente) {
    throw crearError("Ya existe un usuario con ese email.", 409);
  }

  // Genera el hash de la contraseña
  const passwordHash = await bcrypt.hash(password, FACTOR_COSTO);

  // Guarda el hash, nunca la contraseña en texto plano
  return await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash
    },
    select: selectUsuarioSeguro
  });
};

// GET /api/usuarios (Listado paginado con filtros)
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

// GET /api/usuarios/:id
export const obtenerUsuarioPorId = async (id) => {
  return await prisma.usuario.findUnique({
    where: { id },
    select: selectUsuarioSeguro
  });
};

// PUT /api/usuarios/:id
export const actualizarUsuario = async (id, datosActualizarDto) => {
  const datosParaActualizar = { ...datosActualizarDto };

  // Si envían una nueva contraseña, se vuelve a hashear
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

// Servicio de Login (para conectar luego con JWT)
export const iniciarSesion = async (iniciarSesionDto) => {
  const { email, password } = iniciarSesionDto;

  const usuario = await prisma.usuario.findUnique({
    where: { email }
  });

  if (!usuario) {
    throw crearError("Las credenciales son inválidas.", 401);
  }

  // Compara la contraseña provista contra el hash guardado en PostgreSQL
  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

  if (!passwordValida) {
    throw crearError("Las credenciales son inválidas.", 401);
  }

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email
  };
};