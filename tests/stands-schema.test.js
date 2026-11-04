import test from "node:test";
import assert from "node:assert/strict";
import {
  standSchema,
  actualizarStandSchema,
  consultarStandsSchema
} from "../src/validators/standsValidator.js";

const casosCreacion = [
  [
    "stand válido con disponible explícito",
    { numero: 10, sector_id: 1, disponible: true },
    true
  ],
  [
    "stand válido sin disponible (opcional)",
    { numero: 12, sector_id: 2 },
    true
  ],
  [
    "numero ausente",
    { sector_id: 1 },
    false
  ],
  [
    "numero igual a cero",
    { numero: 0, sector_id: 1 },
    false
  ],
  [
    "numero negativo",
    { numero: -3, sector_id: 1 },
    false
  ],
  [
    "sector_id igual a cero",
    { numero: 10, sector_id: 0 },
    false
  ],
  [
    "disponible no booleano",
    { numero: 10, sector_id: 1, disponible: "si" },
    false
  ]
];

for (const [nombre, entrada, valido] of casosCreacion) {
  test(`standSchema: ${nombre}`, () => {
    const resultado = standSchema.safeParse(entrada);
    assert.equal(resultado.success, valido);
  });
}

test("actualizarStandSchema: permite cambiar solo disponibilidad", () => {
  const resultado = actualizarStandSchema.safeParse({ disponible: false });
  assert.equal(resultado.success, true);
});

test("consultarStandsSchema: convierte disponible string 'true' a booleano", () => {
  const resultado = consultarStandsSchema.safeParse({ disponible: "true" });
  assert.equal(resultado.success, true);
  assert.equal(resultado.data.disponible, true);
});

