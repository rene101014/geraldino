export function storagePublicUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

// thumbnail_path guarda una ruta de Supabase Storage para piezas propias,
// pero para proveedores externos (p.ej. Vimeo) guarda la URL absoluta que
// devuelve su API. Esta función resuelve cualquiera de los dos casos.
export function isExternalUrl(path: string): boolean {
  return /^https?:\/\//.test(path);
}

export function mediaUrl(bucket: string, path: string): string {
  return isExternalUrl(path) ? path : storagePublicUrl(bucket, path);
}
