import request from "supertest";

export async function crearEscenario(app, prisma) {
  const password = "ClaveDePrueba2026!";

  const provincia = await prisma.provincia.create({
    data: { nombre: "Catamarca" }
  });

  const localidad = await prisma.localidad.create({
    data: {
      nombre: "Belén",
      provincia_id: provincia.id
    }
  });

  const rubro = await prisma.rubro.create({
    data: { nombre: "Textil" }
  });

  const anio = await prisma.anioPostulacion.create({
    data: { anio: 2026 }
  });

  const rolArtesano = await prisma.rol.findUniqueOrThrow({
    where: { nombre: "ARTESANO" }
  });

  const registrarArtesanoActivo = async (nombre, dni) => {
    const email = `${nombre.toLowerCase()}@clase10.test`;

    const { body: usuario } = await request(app)
      .post("/api/usuarios/registro-artesano")
      .send({
        nombre,
        dni,
        email,
        password,
        rubro_id: rubro.id,
        localidad_id: localidad.id,
        anio_id: anio.id
      })
      .expect(201);

    await prisma.usuarioRol.create({
      data: {
        usuarioId: usuario.id,
        rolId: rolArtesano.id
      }
    });

    const { body: sesion } = await request(app)
      .post("/api/usuarios/login")
      .send({ email, password })
      .expect(200);

    return { usuario, token: sesion.token };
  };

  const { usuario: ana, token: tokenAna } = await registrarArtesanoActivo("Ana", "38000001");
  const { usuario: bruno, token: tokenBruno } = await registrarArtesanoActivo("Bruno", "38000002");

  // Usuario básico sin rol ARTESANO para probar 403 Forbidden
  const emailSinRol = "visitante@clase10.test";
  await request(app)
    .post("/api/usuarios/registro")
    .send({
      nombre: "Visitante Sin Rol",
      email: emailSinRol,
      password
    })
    .expect(201);

  const { body: sesionSinRol } = await request(app)
    .post("/api/usuarios/login")
    .send({ email: emailSinRol, password })
    .expect(200);

  const categoria1 = await prisma.categoria.create({
    data: { nombre: "Ponchos" }
  });

  const categoria2 = await prisma.categoria.create({
    data: { nombre: "Tejidos" }
  });

  return {
    ana,
    bruno,
    tokenAna,
    tokenBruno,
    tokenSinRol: sesionSinRol.token,
    categoria1,
    categoria2,
    anio
  };
}
