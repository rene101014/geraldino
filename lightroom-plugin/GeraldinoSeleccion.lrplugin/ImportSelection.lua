local LrApplication = import "LrApplication"
local LrDialogs = import "LrDialogs"
local LrTasks = import "LrTasks"
local LrPathUtils = import "LrPathUtils"
local LrFileUtils = import "LrFileUtils"

-- Nombre de la colección donde se agregan las fotos elegidas.
local COLLECTION_NAME = "Selección cliente"

LrTasks.startAsyncTask(function()
  -- 1) Elegir el archivo exportado (.txt / .csv)
  local files = LrDialogs.runOpenPanel({
    title = "Elige el archivo de selección exportado (.txt)",
    canChooseFiles = true,
    canChooseDirectories = false,
    allowsMultipleSelection = false,
    fileTypes = { "txt", "csv" },
  })
  if not files or #files == 0 then
    return
  end

  local content = LrFileUtils.readFile(files[1])
  if not content or #content == 0 then
    LrDialogs.message("No se pudo leer el archivo.")
    return
  end

  -- 2) Parsear los nombres, comparando por el nombre SIN extensión (el JPG
  --    entregado y el RAW comparten el mismo nombre base).
  local wanted = {}
  local nWanted = 0
  for line in content:gmatch("[^\r\n]+") do
    local name = line:gsub("^%s+", ""):gsub("%s+$", "")
    if #name > 0 then
      local stem = LrPathUtils.removeExtension(name):lower()
      if not wanted[stem] then
        wanted[stem] = true
        nWanted = nWanted + 1
      end
    end
  end
  if nWanted == 0 then
    LrDialogs.message("El archivo no contiene nombres de fotos.")
    return
  end

  -- 3) Recorrer el catálogo y encontrar coincidencias por nombre base.
  local catalog = LrApplication.activeCatalog()
  local photos = catalog:getAllPhotos()

  local matched = {}
  for _, photo in ipairs(photos) do
    local fn = photo:getFormattedMetadata("fileName")
    if fn then
      local stem = LrPathUtils.removeExtension(fn):lower()
      if wanted[stem] then
        matched[#matched + 1] = photo
      end
    end
  end

  if #matched == 0 then
    LrDialogs.message(
      "No se encontró ninguna foto del catálogo que coincida con el archivo.\n\n" ..
      "Verifica que las fotos de esta sesión estén importadas en Lightroom y " ..
      "que conserven su nombre original."
    )
    return
  end

  -- 4) Marcar con bandera (Pick) y agregar a la colección.
  catalog:withWriteAccessDo("Importar selección Geraldino", function()
    for _, photo in ipairs(matched) do
      photo:setRawMetadata("pickStatus", 1) -- 1 = Pick / bandera blanca
    end
    local collection = catalog:createCollection(COLLECTION_NAME, nil, true)
    if collection then
      collection:addPhotos(matched)
    end
  end)

  LrDialogs.message(
    string.format(
      "Listo.\n\n%d de %d fotos fueron marcadas con bandera y agregadas a la " ..
      "colección \"%s\".",
      #matched, nWanted, COLLECTION_NAME
    )
  )
end)
