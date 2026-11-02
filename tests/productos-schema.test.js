import test from "node:test";
import assert from "node:assert/strict";
import {
  productoSchema,
  actualizarProductoSchema,
  consultarProductosSchema
} from "../src/validators/productosValidator.js";

const casosCreacion = [
  [
    "producto válido completo",
    {
      nombre: "Poncho de Vicuña",
      descripcion: "Tejido artesanal en telar",
      precio: 150000.5,
      categoria_id: 1
    },
    true
  ],
  [
    "producto válido sin descripción",
    { nombre: "Poncho de Llama", precio: 85000, categoria_id: 2 },
    true
  ],
  [
    "nombre ausente",
    { precio: 85000, categoria_id: 2 },
    false
  ],
  [
    "nombre supera 100 caracteres",
    { nombre: "A".repeat(101), precio: 85000, categoria_id: 2 },
    false
  ],
  [
    "precio igual a cero",
    { nombre: "Poncho", precio: 0, categoria_id: 1 },
    false
  ],
  [
    "precio negativo",
    { nombre: "Poncho", precio: -100, categoria_id: 1 },
    false
  ],
  [
    "precio con más de 2 decimales",
    { nombre: "Poncho", precio: 100.123, categoria_id: 1 },
    false
  ],
  [
    "categoria_id igual a cero",
    { nombre: "Poncho", precio: 1000, categoria_id: 0 },
    false
  ],
  [
    "categoria_id decimal",
    { nombre: "Poncho", precio: 1000, categoria_id: 1.5 },
    false
  ]
];

for (const [nombre, entrada, valido] of casosCreacion) {
  test(`productoSchema: ${nombre}`, () => {
    const resultado = productoSchema.safeParse(entrada);
    assert.equal(resultado.success, valido);
  });
}

test("actualizarProductoSchema: permite actualizar solo el precio", () => {
  const resultado = actualizarProductoSchema.safeParse({ precio: 95000.99 });
  assert.equal(resultado.success, true);
});

test("consultarProductosSchema: rechaza precioMin mayor que precioMax", () => {
  const resultado = consultarProductosSchema.safeParse({
    precioMin: 50000,
    precioMax: 10000
  });
  assert.equal(resultado.success, false);
});

