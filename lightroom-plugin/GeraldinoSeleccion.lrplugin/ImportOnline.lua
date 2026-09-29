local LrApplication = import "LrApplication"
local LrDialogs = import "LrDialogs"
local LrTasks = import "LrTasks"
local LrHttp = import "LrHttp"
local LrPathUtils = import "LrPathUtils"
local LrPrefs = import "LrPrefs"
local LrView = import "LrView"
local LrBinding = import "LrBinding"
local LrFunctionContext = import "LrFunctionContext"

-- Dominio de tu web publicada.
local BASE = "https://www.geraldinodr.com"
local COLLECTION_NAME = "Selección cliente"

local prefs = LrPrefs.prefsForPlugin()

-- Pide (y guarda) la llave de estudio si no está configurada.
local function ensureApiKey()
  if prefs.apiKey and #prefs.apiKey > 0 then
    return prefs.apiKey
  end
  local result
  LrFunctionContext.callWithContext("askKey", function(context)
    local props = LrBinding.makePropertyTable(context)
    props.key = ""
    local f = LrView.osFactory()
    local c = f:column{
      spacing = f:control_spacing(),
      f:static_text{ title = "Pega tu llave de estudio (una sola vez):" },
      f:edit_field{ value = LrView.bind("key"), width_in_chars = 40 },
    }
    local r = LrDialogs.presentModalDialog{ title = "Geraldino — Selección", contents = c }
    if r == "ok" and props.key and #props.key > 0 then
      prefs.apiKey = props.key
      result = props.key
    end
  end)
  return result
end

-- GET con la llave en el header. Devuelve body o nil + mensaje.
local function apiGet(path, key)
  local body, hdrs = LrHttp.get(BASE .. path, { { field = "x-api-key", value = key } })
  if not body then
    return nil, "No se pudo conectar con la web."
  end
  if hdrs and hdrs.status == 401 then
    return nil, "401"
  end
  if hdrs and hdrs.status ~= 200 then
    return nil, "Error del servidor (" .. tostring(hdrs.status) .. ")."
  end
  return body
end

-- Marca las fotos por nombre y las agrega a la colección.
local function applyFilenames(filenames)
  local wanted = {}
  local nWanted = 0
  for _, name in ipairs(filenames) do
    local stem = LrPathUtils.removeExtension(name):lower()
    if #stem > 0 and not wanted[stem] then
      wanted[stem] = true
      nWanted = nWanted + 1
    end
  end
  if nWanted == 0 then
    LrDialogs.message("Esa selección no tiene fotos.")
    return
  end

  local catalog = LrApplication.activeCatalog()
  local matched = {}
  for _, photo in ipairs(catalog:getAllPhotos()) do
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
      "No se encontró ninguna foto del catálogo que coincida.\n\n" ..
      "Verifica que las fotos de esta sesión estén importadas en Lightroom y " ..
      "conserven su nombre original."
    )
    return
  end

  catalog:withWriteAccessDo("Importar selección Geraldino", function()
    for _, photo in ipairs(matched) do
      photo:setRawMetadata("pickStatus", 1)
    end
    local collection = catalog:createCollection(COLLECTION_NAME, nil, true)
    if collection then
      collection:addPhotos(matched)
    end
  end)

  LrDialogs.message(
    string.format(
      "Listo.\n\n%d de %d fotos marcadas con bandera y agregadas a la colección \"%s\".",
      #matched, nWanted, COLLECTION_NAME
    )
  )
end

LrTasks.startAsyncTask(function()
  local key = ensureApiKey()
  if not key then return end

  -- 1) Traer la lista de selecciones recientes.
  local body, err = apiGet("/api/lightroom/galleries", key)
  if not body then
    if err == "401" then
      prefs.apiKey = nil
      LrDialogs.message("La llave de estudio no es válida. Vuelve a intentarlo e ingrésala de nuevo.")
    else
      LrDialogs.message(err or "Error.")
    end
    return
  end

  -- 2) Parsear: submissionId \t título \t cliente \t nºfotos \t fecha
  local items = {}
  local map = {}
  for line in body:gmatch("[^\r\n]+") do
    local id, title, client, count, date = line:match("^(.-)\t(.-)\t(.-)\t(.-)\t(.+)$")
    if id then
      local label = title
      if client and #client > 0 then label = label .. " — " .. client end
      label = label .. " · " .. count .. " fotos · " .. (date:sub(1, 10))
      items[#items + 1] = { title = label, value = id }
      map[id] = true
    end
  end

  if #items == 0 then
    LrDialogs.message("Todavía no hay selecciones enviadas por clientes.")
    return
  end

  -- 3) Desplegable para elegir cuál importar.
  local chosen
  LrFunctionContext.callWithContext("pick", function(context)
    local props = LrBinding.makePropertyTable(context)
    props.choice = items[1].value
    local f = LrView.osFactory()
    local c = f:column{
      spacing = f:control_spacing(),
      f:static_text{ title = "Elige la selección de cliente a importar:" },
      f:popup_menu{ value = LrView.bind("choice"), items = items, width = 460 },
    }
    local r = LrDialogs.presentModalDialog{ title = "Geraldino — Selección", contents = c }
    if r == "ok" then chosen = props.choice end
  end)
  if not chosen then return end

  -- 4) Traer los nombres de esa selección y aplicarlos.
  local namesBody, err2 = apiGet("/api/lightroom/submissions/" .. chosen, key)
  if not namesBody then
    LrDialogs.message(err2 or "No se pudo traer la selección.")
    return
  end

  local filenames = {}
  for name in namesBody:gmatch("[^\r\n]+") do
    local n = name:gsub("^%s+", ""):gsub("%s+$", "")
    if #n > 0 then filenames[#filenames + 1] = n end
  end

  applyFilenames(filenames)
end)
