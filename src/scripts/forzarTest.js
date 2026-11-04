// src/scripts/forzarTest.js
// Fuerza NODE_ENV=test. Se importa PRIMERO en los scripts de pruebas porque
// los import de ES modules se ejecutan antes que el resto del código.
process.env.NODE_ENV = "test";
