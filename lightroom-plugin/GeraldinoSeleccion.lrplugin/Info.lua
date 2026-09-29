--[[
  Plugin de Lightroom Classic — Geraldino Selección

  Trae la selección que hizo el cliente y marca esas fotos con bandera (Pick)
  agregándolas a una colección, por coincidencia de nombre de archivo.

  Dos formas:
   - "Importar selección de cliente (en línea)…": se conecta a tu web y te
     muestra un desplegable con las selecciones recientes. Sin archivos.
   - "Importar selección desde archivo…": usa un .txt exportado del panel.
]]

return {
  LrSdkVersion = 10.0,
  LrSdkMinimumVersion = 6.0,
  LrToolkitIdentifier = "com.geraldino.seleccion",
  LrPluginName = "Geraldino — Selección",

  LrLibraryMenuItems = {
    {
      title = "Importar selección de cliente (en línea)…",
      file = "ImportOnline.lua",
    },
    {
      title = "Importar selección desde archivo…",
      file = "ImportSelection.lua",
    },
  },

  VERSION = { major = 1, minor = 1, revision = 0, build = 0 },
}
