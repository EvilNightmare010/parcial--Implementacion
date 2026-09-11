# Frontend — Camel vs. Dwarf Racing League (versión de una sola página)

Un único `index.html` con **todas las pantallas dentro**, que se muestran/ocultan con
JavaScript según la URL (`#/dashboard`, `#/competitors`, `#/races/12`, etc.) sin recargar
la página. Sigue siendo HTML + CSS + JS puro, sin frameworks ni build tools.

## 🗂️ Estructura

```
frontend/
├── index.html          ← ÚNICO archivo HTML, contiene todas las vistas
├── css/style.css
├── js/
│   ├── config.js        (URL de la API)
│   ├── auth.js           (sesión: login/logout/rol)
│   ├── api.js             (fetch centralizado con manejo de errores)
│   ├── ui.js                (toasts, loading, estados vacíos, modal confirm)
│   ├── nav.js                 (barra de navegación)
│   ├── router.js                 (el "cerebro": decide qué vista mostrar)
│   └── views/
│       ├── login.js
│       ├── dashboard.js
│       ├── competitors.js
│       ├── teams.js
│       ├── races.js
│       ├── raceDetail.js
│       ├── standings.js
│       └── profile.js
├── Dockerfile
└── nginx.conf
```

Cada archivo dentro de `views/` controla **una sola pantalla**: pinta sus datos, valida
sus formularios y maneja sus propios botones. `router.js` decide cuál mostrar según el
hash de la URL, y `nav.js` arma el menú de arriba. No necesitas tocar `index.html` para
casi nada del comportamiento — solo si agregas una pantalla nueva.

## 🧭 Cómo funciona la navegación

Cambia el "hash" al final de la URL (la parte después de `#`), y `router.js` reacciona
automáticamente:

| URL | Vista |
|---|---|
| `index.html#/dashboard` | Dashboard |
| `index.html#/competitors` | Competidores |
| `index.html#/teams` | Equipos |
| `index.html#/races` | Lista de carreras |
| `index.html#/races/12` | Detalle de la carrera con id 12 |
| `index.html#/standings` | Clasificación |
| `index.html#/profile` | Perfil |
| `index.html#/login` | Login (si no hay sesión, siempre termina aquí) |

Todos los enlaces del menú y los botones ya usan `href="#/..."`, así que no necesitas
escribir estas URLs a mano salvo para probar directo en el navegador.

## 🚀 Cómo probarlo mientras desarrollas

1. Backend corriendo (`docker compose up -d`, con tu `.env` ya creado).
2. Clic derecho sobre `index.html` → "Open with Live Server".
3. Inicia sesión con el usuario administrador que creaste con `POST /api/auth/register`.

## ⚠️ Cosas que DEBES verificar/ajustar antes de la entrega

Armé todo basándome en el PDF del proyecto y el diagrama entidad-relación, no en el
código real del backend. Revisa esto con tu compañero y ajusta si hace falta:

1. **`js/auth.js`** — el shape exacto de la respuesta de `POST /api/auth/login`.
2. **Nombres de campos JSON** en `js/views/competitors.js`, `teams.js`, `races.js`,
   `raceDetail.js` — cubrí `snake_case` y `camelCase` con `??` pero confírmalo.
3. **Nombres exactos de los roles** en `ROLES` (`js/auth.js`).
4. **Parámetros de filtro/paginación** de `GET /api/competitors`.
5. **CORS**: si el login falla con error de red en consola, pide a tu compañero que
   habilite CORS para el origen desde donde sirves el frontend.
   
## 🐳 Dockerizar

Igual que antes, agrega esto al `compose.yml` de la raíz (ajusta el puerto si en tu
compañero el backend usa 8080 normalmente — este cambio de puerto en tu `.env` local
es solo tuyo, no lo subas si tu compañero no tiene el mismo conflicto):

```yaml
  frontend:
    build: ./frontend
    ports:
      - "8081:80"
    depends_on:
      - backend
```

## ✅ Checklist contra los requisitos del PDF (Módulo 7)

Todo lo que ya tenías en la versión multipágina sigue cumplido, solo que ahora vive
dentro de un único HTML con vistas que se alternan:

- [x] Login, Dashboard, Competidores (búsqueda/filtros/paginación/alta/edición),
      Equipos (con miembros), Carreras (lista + detalle + inscripciones + resultados),
      Clasificación, Perfil, pantallas 403/404.
- [x] Botones ocultos/deshabilitados según rol.
- [x] Token guardado y enviado en cada petición.
- [x] Validaciones con mensajes por campo, errores legibles, confirmaciones,
      estados vacíos/carga/error, notificaciones visibles.
- [x] Rutas protegidas: sin sesión, cualquier hash te manda a `#/login` automáticamente.

## 🧪 Prueba rápida de humo

1. Login como admin.
2. Crear un competidor (camello "Byte") y los 5 dwarfs, agregarlos a un equipo.
3. Crear una carrera, entrar al detalle (`#/races/ID`), aprobar una inscripción.
4. Registrar un resultado, verificar en clasificación.
5. Cerrar sesión y probar poner directo en la URL `#/competitors` sin login → debe
   mandarte a `#/login`.
6. Loguear como Viewer y confirmar que los botones de crear/editar están ocultos.
