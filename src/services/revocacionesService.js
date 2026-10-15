import prisma from "../config/prisma.js";

// Guarda el jti del token en la lista de revocados.
// venceEn = fecha de vencimiento del token (exp viene en segundos).
export const revocarToken = async ({ jti, exp }) => {
  await prisma.tokenRevocado.upsert({
    where: { jti },
    update: {},
    create: { jti, venceEn: new Date(exp * 1000) }
  });
};

// Indica si un token (por su jti) fue revocado
export const tokenEstaRevocado = async (jti) => {
  const registro = await prisma.tokenRevocado.findUnique({
    where: { jti }
  });
  return registro !== null;
};

// Borra solo las revocaciones de tokens que ya vencieron
export const eliminarRevocacionesVencidas = async () => {
  const resultado = await prisma.tokenRevocado.deleteMany({
    where: { venceEn: { lt: new Date() } }
  });
  return resultado.count;
};
