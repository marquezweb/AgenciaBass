# Agencia BASS

Demo de agencia creativa: contenido, estrategia y producción audiovisual. HTML, CSS y JavaScript, sin dependencias de aplicación.

## Desarrollo

Requiere Node.js moderno (20.11 o posterior).

- `npm run dev`: servidor local en http://127.0.0.1:4173/
- `npm run build`: valida JavaScript, recursos, IDs y anclas; genera `dist/`.
- `npm run preview`: sirve el build localmente.

La web también puede alojarse como sitio estático desde la raíz del repositorio. El servidor local admite solicitudes parciales para los videos.

## Contenido e interacciones

Recursos reales seleccionados de BASS, con referencias en `assets/media-manifest.json` y `content/inventory.md`. Portfolio con visor, reels con sonido, menú responsive, servicios desplegables y contacto por WhatsApp.

Hero con luz y ondas que responden al cursor; entradas por bloques, afiches con profundidad y manifiesto azul en dos tiempos. Se respeta la preferencia de reducción de movimiento.

## Validación

Build comprobado. Comprobaciones de lógica de contadores y selector de servicios; archivos locales y carga parcial de los cuatro MP4 verificados por HTTP. La última revisión visual de escritorio y móvil está pendiente debido a una restricción de la herramienta de navegador utilizada.

No contiene credenciales ni requiere variables de entorno. Antes de publicar con dominio definitivo, usar una URL absoluta para `og:image`.
