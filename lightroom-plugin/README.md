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

## Usar (cada sesión)
1. En el panel de Galerías, abre la galería y en la selección del cliente pulsa
   **"Exportar nombres (Lightroom)"** → se descarga un `.txt`.
2. En Lightroom Classic: menú **Archivo → Extras de plugins → Importar
   selección de cliente…**
3. Elige el `.txt` descargado.
4. El plugin marca las fotos con bandera y crea/llena la colección
   **"Selección cliente"**. Te muestra cuántas encontró.

> Si alguna no aparece, revisa que esté importada en el catálogo y que
> conserve su nombre original.
