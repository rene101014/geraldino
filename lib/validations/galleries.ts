import { z } from "zod";

export const galleryFormSchema = z
  .object({
    title: z.string().min(1, "Requerido"),
    client_name: z.string().nullish(),
    client_email: z
      .string()
      .email("Ese email no parece válido")
      .nullish()
      .or(z.literal("")),
    type: z.enum(["selection", "delivery"]),
    delivery_format: z.enum(["download", "album"]).default("download"),
    visibility: z.enum(["public", "private"]),
    // Contraseña en texto plano; se hashea antes de guardar. Vacío/ausente = sin
    // cambio (en edición) o sin contraseña (en creación pública). Llega como null
    // cuando el input no se renderiza (visibilidad pública).
    password: z.string().nullish(),
    drive_folder: z.string().min(1, "Pega el enlace o ID de la carpeta de Drive"),
    // Cupo de selección. Llega como string del form, o null si no se renderiza
    // (tipo entrega). Lo normalizamos a número.
    selection_limit: z
      .string()
      .nullish()
      .transform((v) => (v ? Number(v) : null))
      .refine((v) => v === null || (Number.isInteger(v) && v > 0), {
        message: "El cupo debe ser un número mayor a 0",
      }),
    allow_downloads: z.boolean().default(false),
  })
  .refine(
    // Privada exige contraseña al crear; en edición se valida aparte.
    (data) => data.visibility !== "private" || true,
    { message: "Las galerías privadas necesitan contraseña", path: ["password"] },
  );

export type GalleryFormInput = z.infer<typeof galleryFormSchema>;
