--[[
  Plugin de Lightroom Classic — Geraldino Selección
  Lee un archivo .txt/.csv con los nombres de archivo que eligió el cliente
  (exportado desde el panel de Galerías) y, por coincidencia de nombre,
  marca esas fotos con bandera (Pick) y las agrega a una colección.
]]

return {
  LrSdkVersion = 10.0,
  LrSdkMinimumVersion = 6.0,
  LrToolkitIdentifier = "com.geraldino.seleccion",
  LrPluginName = "Geraldino — Selección",

  LrLibraryMenuItems = {
    {
      title = "Importar selección de cliente…",
      file = "ImportSelection.lua",
    },
  },

  VERSION = { major = 1, minor = 0, revision = 0, build = 0 },
}
