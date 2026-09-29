# Geraldino — Plugin de Selección para Lightroom Classic

Lee el archivo de nombres que exportas desde el panel de Galerías (botón
"Exportar nombres (Lightroom)") y, por coincidencia de nombre de archivo,
**marca con bandera (Pick)** las fotos elegidas y las agrega a una colección
llamada **"Selección cliente"**.

## Requisitos
- Lightroom **Classic** (no la versión Cloud/CC).
- Que las fotos de la sesión estén importadas en tu catálogo **conservando su
  nombre original** (el JPG entregado y el RAW comparten el mismo nombre base,
  ej. `_DSC1234`).

## Instalar (una sola vez)
1. Descomprime el archivo `GeraldinoSeleccion.lrplugin` si vino en .zip.
2. En Lightroom Classic: menú **Archivo → Administrador de plugins…**
3. Clic en **Agregar**, elige la carpeta `GeraldinoSeleccion.lrplugin` y **Aceptar**.

## Usar — Opción A: en línea con desplegable (recomendado)
La primera vez necesitas tu **llave de estudio** (la misma que está en Vercel
como `LIGHTROOM_API_KEY`).
1. En Lightroom Classic: menú **Biblioteca (Library) → Extras de plugins →
   "Importar selección de cliente (en línea)…"**
2. La primera vez te pide la llave de estudio → pégala (se guarda).
3. Aparece un **desplegable con las selecciones recientes** de tus clientes →
   elige una → **OK**.
4. El plugin marca las fotos con bandera y las agrega a la colección
   **"Selección cliente"**. Sin archivos ni descargas.

## Usar — Opción B: desde archivo (.txt)
1. En el panel de Galerías, en la selección del cliente pulsa
   **"Exportar nombres (Lightroom)"** → se descarga un `.txt`.
2. En Lightroom: **Biblioteca → Extras de plugins → "Importar selección desde
   archivo…"** → elige el `.txt`.

> Si alguna no aparece, revisa que esté importada en el catálogo y que
> conserve su nombre original.
