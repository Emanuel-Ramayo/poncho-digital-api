import prisma from "../config/prisma.js";

// Cuenta recursivamente la cantidad de campos escalares presentes en un objeto o estructura anidada
function contarCampos(obj) {
  if (typeof obj !== "object" || obj === null) return 1;
  let total = 0;
  for (const valor of Object.values(obj)) {
    if (Array.isArray(valor)) {
      total += valor.length > 0 ? contarCampos(valor[0]) : 0;
    } else if (typeof valor === "object" && valor !== null) {
      total += contarCampos(valor);
    } else {
      total += 1;
    }
  }
  return total;
}

async function medir() {
  try {
    console.log("==========================================================");
    console.log(" BENCHMARK: OPTIMIZACIÓN DE CONSULTAS EN ARTESANOS");
    console.log("==========================================================\n");

    // 1. Consulta Original (con include masivo y árboles anidados)
    const inicioAntes = process.hrtime.bigint();
    const antes = await prisma.artesano.findMany({
      include: {
        rubro: { select: { id: true, nombre: true } },
        localidad: { include: { provincia: true } },
        productos: { include: { categoria: true } },
        postulaciones: {
          include: {
            anio: true,
            stand: { include: { sector: { include: { pabellon: true } } } }
          }
        }
      }
    });
    const finAntes = process.hrtime.bigint();

    // 2. Consulta Optimizada (con select granular exacto)
    const inicioDespues = process.hrtime.bigint();
    const despues = await prisma.artesano.findMany({
      select: {
        nombre: true,
        rubro: { select: { nombre: true } },
        localidad: {
          select: {
            nombre: true,
            provincia: { select: { nombre: true } }
          }
        }
      }
    });
    const finDespues = process.hrtime.bigint();

    const jsonAntes = JSON.stringify(antes);
    const jsonDespues = JSON.stringify(despues);

    // Métricas de tamaño
    const bytesAntes = Buffer.byteLength(jsonAntes);
    const bytesDespues = Buffer.byteLength(jsonDespues);
    const reduccionBytes = (((bytesAntes - bytesDespues) / bytesAntes) * 100).toFixed(2);

    // Métricas de campos contados dinámicamente
    const camposAntes = antes.length > 0 ? contarCampos(antes[0]) : 0;
    const camposDespues = despues.length > 0 ? contarCampos(despues[0]) : 0;
    const reduccionCampos = camposAntes > 0
      ? (((camposAntes - camposDespues) / camposAntes) * 100).toFixed(2)
      : "0.00";

    // Métricas de tiempo de ejecución
    const msAntes = Number(finAntes - inicioAntes) / 1_000_000;
    const msDespues = Number(finDespues - inicioDespues) / 1_000_000;

    console.log(`Registros analizados en la base de datos: ${antes.length}\n`);

    console.table([
      {
        Métrica: "Tamaño Payload (Bytes)",
        "Antes (include)": `${bytesAntes} B`,
        "Después (select)": `${bytesDespues} B`,
        Diferencia: `${reduccionBytes}%`
      },
      {
        Métrica: "Campos por elemento",
        "Antes (include)": `${camposAntes} atributos`,
        "Después (select)": `${camposDespues} atributos`,
        Diferencia: `${reduccionCampos}%`
      },
      {
        Métrica: "Tiempo ejecución consulta",
        "Antes (include)": `${msAntes.toFixed(2)} ms`,
        "Después (select)": `${msDespues.toFixed(2)} ms`,
        Diferencia: msAntes > msDespues ? `${(((msAntes - msDespues) / msAntes) * 100).toFixed(1)}%` : "Similar"
      }
    ]);

    console.log("\nEjemplo de elemento ANTES (primer registro):");
    console.log(JSON.stringify(antes[0], null, 2));

    console.log("\nEjemplo de elemento DESPUÉS (primer registro):");
    console.log(JSON.stringify(despues[0], null, 2));

    console.log("\n==========================================================");
  } catch (error) {
    console.error("Error al ejecutar la medición:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

medir();
