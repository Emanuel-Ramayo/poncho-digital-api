import { eliminarRevocacionesVencidas } from "../services/revocacionesService.js";

const INTERVALO_MS = 60 * 60 * 1000; // cada 1 hora

// Se llama una vez al arrancar el servidor
export const iniciarLimpiezaRevocaciones = () => {
  const limpiar = async () => {
    try {
      const borrados = await eliminarRevocacionesVencidas();
      if (borrados > 0) {
        console.log(`Limpieza: ${borrados} revocaciones vencidas eliminadas`);
      }
    } catch (error) {
      console.error("Error al limpiar revocaciones:", error.message);
    }
  };

  limpiar(); // una vez al iniciar
  const temporizador = setInterval(limpiar, INTERVALO_MS);
  temporizador.unref(); // no impide que el proceso termine
  return temporizador;
};
