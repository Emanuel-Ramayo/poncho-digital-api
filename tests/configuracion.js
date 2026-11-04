// tests/configuracion.js
// Se precarga con "node --import" antes de cualquier test.
// Fuerza NODE_ENV=test para que app.js y prisma.js usen la BD de pruebas.
process.env.NODE_ENV = "test";
