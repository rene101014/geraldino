// Helper para las lecturas públicas de Supabase.
//
// Antes cada getter hacía `const { data } = await supabase...` e ignoraba
// `error` por completo. Cuando Supabase fallaba (timeout, rate limit,
// proyecto pausado), `data` venía null, la página renderizaba con los
// fallbacks vacíos y las secciones condicionales simplemente desaparecían.
// Peor: unstable_cache guardaba ese resultado vacío y, al no tener
// revalidate, se quedaba cacheado hasta que alguien tocara el admin.
//
// Ahora el error se propaga: Next no cachea un throw, así que el próximo
// request reintenta en vez de servir una versión rota indefinidamente.
export function unwrap<T>(
  { data, error }: { data: T | null; error: { message: string } | null },
  what: string,
): T | null {
  if (error) {
    console.error(`[data] Falló la lectura de ${what}: ${error.message}`);
    throw new Error(`Supabase: no se pudo leer ${what}`);
  }
  return data;
}
