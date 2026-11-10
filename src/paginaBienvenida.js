// Página de bienvenida de la API (GET /).
// Mantiene el texto "Bienvenido a la API REST de Poncho digital" para que la verificación de la guía siga valiendo.
export const paginaBienvenida = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Poncho Digital API</title>
<style>
  :root{
    --bg:#faf6f0; --card:#ffffff; --text:#1f2937; --muted:#6b7280;
    --accent:#b45309; --accent2:#0f766e; --border:#e7dccb;
  }
  @media (prefers-color-scheme: dark){
    :root{ --bg:#16130f; --card:#211c16; --text:#f3ede3; --muted:#a89f90; --accent:#f59e0b; --accent2:#2dd4bf; --border:#3a3126; }
  }
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--text);padding:24px}
  main{width:100%;max-width:720px;background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden}
  .banda{height:10px;background:repeating-linear-gradient(90deg,#b45309 0 40px,#0f766e 40px 80px,#7f1d1d 80px 120px)}
  .contenido{padding:36px 32px}
  .estado{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--accent2);
    border:1px solid var(--accent2);border-radius:999px;padding:4px 12px}
  .punto{width:8px;height:8px;border-radius:50%;background:var(--accent2)}
  h1{font-size:34px;margin:18px 0 6px}
  p.sub{margin:0 0 24px;color:var(--muted);font-size:16px;line-height:1.5}
  .botones{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px}
  a.btn{text-decoration:none;font-weight:600;padding:11px 20px;border-radius:10px;font-size:15px}
  a.principal{background:var(--accent);color:#fff}
  a.secundario{border:1px solid var(--border);color:var(--text)}
  h2{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
  .grilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:26px}
  .item{border:1px solid var(--border);border-radius:12px;padding:12px 14px}
  .item b{display:block;font-size:14px}
  .item code{font-size:12px;color:var(--muted)}
  .stack{display:flex;gap:8px;flex-wrap:wrap}
  .stack span{font-size:12px;border:1px solid var(--border);border-radius:8px;padding:4px 10px;color:var(--muted)}
  footer{margin-top:26px;font-size:12px;color:var(--muted)}
</style>
</head>
<body>
<main>
  <div class="banda"></div>
  <div class="contenido">
    <span class="estado"><span class="punto"></span> API en línea</span>
    <h1>Poncho Digital API</h1>
    <p class="sub">Bienvenido a la API REST de Poncho digital. Gestión de artesanos, productos, stands y postulaciones.</p>

    <div class="botones">
      <a class="btn principal" href="/api/docs">Ver documentación (Swagger)</a>
      <a class="btn secundario" href="/api/productos">Ver productos</a>
    </div>

    <h2>Recursos públicos</h2>
    <div class="grilla">
      <div class="item"><b>Artesanos</b><code>GET /api/artesanos</code></div>
      <div class="item"><b>Productos</b><code>GET /api/productos</code></div>
      <div class="item"><b>Stands</b><code>GET /api/stands</code></div>
      <div class="item"><b>Postulaciones</b><code>POST /api/postulaciones</code></div>
    </div>

    <h2>Tecnologías</h2>
    <div class="stack">
      <span>Node.js 24</span><span>Express 5</span><span>PostgreSQL</span>
      <span>Prisma</span><span>JWT</span><span>Zod</span><span>Swagger</span>
    </div>

    <footer>Grupo 3 · Laboratorio de Desarrollo Backend · FTyCA · UNCA</footer>
  </div>
</main>
</body>
</html>`;
