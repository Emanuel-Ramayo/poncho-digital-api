// tests/helpers/baseDatos.js
// Funciones de apoyo para dejar la BD de pruebas en un estado conocido.
import bcrypt from "bcrypt";
import prisma from "../../src/config/prisma.js";

// Tablas que se vacían entre pruebas. "Rol" NO se incluye porque sus
// registros (ARTESANO y ADMINISTRADOR) los carga la migración.
const TABLAS_A_LIMPIAR = [
  "Postulacion", "Producto", "Stand", "Sector", "Pabellon", "Categoria",
  "Artesano", "UsuarioRol", "TokenRevocado", "Usuario",
  "Localidad", "Provincia", "Rubro", "AnioPostulacion"
];

// limpiarBaseDatos: vacía las tablas de datos y reinicia los contadores de ID
export const limpiarBaseDatos = async () => {
  const lista = TABLAS_A_LIMPIAR.map((t) => `"${t}"`).join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${lista} RESTART IDENTITY CASCADE`
  );
};

// sembrarDatosBase: crea provincia, localidad, rubro y año de postulación
// necesarios para registrar artesanos. Devuelve sus IDs.
export const sembrarDatosBase = async () => {
  const provincia = await prisma.provincia.create({ data: { nombre: "Catamarca" } });
  const localidad = await prisma.localidad.create({
    data: { nombre: "Belén", provincia_id: provincia.id }
  });
  const rubro = await prisma.rubro.create({ data: { nombre: "Textil" } });
  const anio = await prisma.anioPostulacion.create({
    data: { anio: new Date().getFullYear() }
  });

  return { rubro_id: rubro.id, localidad_id: localidad.id, anio_id: anio.id };
};

// crearAdministradorPrueba: inserta un usuario con rol ADMINISTRADOR
// directamente en la BD (el primer admin no puede crearse por la API).
export const crearAdministradorPrueba = async ({
  nombre = "Admin Test",
  email = "admin@test.com",
  password = "AdminTest2026!"
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 4); // costo bajo: más rápido en tests

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      passwordHash,
      activo: true,
      roles: { create: { rol: { connect: { nombre: "ADMINISTRADOR" } } } }
    }
  });

  return { id: usuario.id, email, password };
};

// crearArtesanoPrueba: crea un usuario y su perfil de Artesano SIN rol ARTESANO.
// Se usa para probar la postulación pública y la aprobación posterior,
// que es la que asigna el rol ARTESANO al usuario.
export const crearArtesanoPrueba = async ({
  nombre = "Artesano Test",
  dni = "38123456",
  email = "artesano@test.com",
  password = "Artesano2026!",
  rubro_id,
  localidad_id
} = {}) => {
  const passwordHash = await bcrypt.hash(password, 4); // costo bajo: más rápido en tests

  // 1. Cuenta de usuario activa pero sin roles
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash, activo: true }
  });

  // 2. Perfil de artesano vinculado a la cuenta
  const artesano = await prisma.artesano.create({
    data: { nombre, dni, rubro_id, localidad_id, usuarioId: usuario.id }
  });

  return {
    id: artesano.id,
    dni: artesano.dni,
    usuarioId: usuario.id,
    email,
    password
  };
};

// cerrarConexion: cierra la conexión de Prisma al terminar los tests
export const cerrarConexion = async () => {
  await prisma.$disconnect();
};
