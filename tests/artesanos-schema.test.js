import test from "node:test";
import assert from "node:assert/strict";
import {
  artesanoSchema,
  actualizarArtesanoSchema,
  consultarArtesanosSchema
} from "../src/validators/artesanosValidator.js";

const UUID_VALIDO = "550e8400-e29b-41d4-a716-446655440000";

const casosCreacion = [
  [
    "datos válidos completos",
    { nombre: "María Catamarca", rubro_id: 1, localidad_id: 2, usuarioId: UUID_VALIDO },
    true
  ],
  [
    "nombre ausente",
    { rubro_id: 1, localidad_id: 2, usuarioId: UUID_VALIDO },
    false
  ],
  [
    "nombre vacío con espacios",
    { nombre: "   ", rubro_id: 1, localidad_id: 2, usuarioId: UUID_VALIDO },
    false
  ],
  [
    "rubro_id igual a cero",
    { nombre: "María Catamarca", rubro_id: 0, localidad_id: 2, usuarioId: UUID_VALIDO },
    false
  ],
  [
    "rubro_id negativo",
    { nombre: "María Catamarca", rubro_id: -5, localidad_id: 2, usuarioId: UUID_VALIDO },
    false
  ],
  [
    "rubro_id decimal",
    { nombre: "María Catamarca", rubro_id: 1.5, localidad_id: 2, usuarioId: UUID_VALIDO },
    false
  ],
  [
    "localidad_id ausente",
    { nombre: "María Catamarca", rubro_id: 1, usuarioId: UUID_VALIDO },
    false
  ],
  [
    "usuarioId con formato inválido",
    { nombre: "María Catamarca", rubro_id: 1, localidad_id: 2, usuarioId: "no-es-uuid" },
    false
  ]
];

for (const [nombre, entrada, valido] of casosCreacion) {
  test(`artesanoSchema: ${nombre}`, () => {
    const resultado = artesanoSchema.safeParse(entrada);
    assert.equal(resultado.success, valido);
  });
}

test("actualizarArtesanoSchema: permite actualización parcial", () => {
  const resultado = actualizarArtesanoSchema.safeParse({ nombre: "Nuevo Nombre" });
  assert.equal(resultado.success, true);
});

test("consultarArtesanosSchema: aplica valores por defecto de paginación y rechaza límite mayor a 50", () => {
  const porDefecto = consultarArtesanosSchema.safeParse({});
  assert.equal(porDefecto.success, true);
  assert.equal(porDefecto.data.pagina, 1);
  assert.equal(porDefecto.data.limite, 10);

  const limiteInvalido = consultarArtesanosSchema.safeParse({ limite: 51 });
  assert.equal(limiteInvalido.success, false);
});

