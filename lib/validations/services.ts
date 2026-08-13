import { z } from "zod";

export const serviceFormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Requerido"),
  description: z.string().min(1, "Requerido"),
  order_index: z.coerce.number().int(),
  published: z.coerce.boolean(),
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;
