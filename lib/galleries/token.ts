import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Token público de la galería: 24 bytes en base64url => imposible de adivinar.
// Va en la URL /g/<token>. No revela nada del contenido.
export function generateGalleryToken(): string {
  return randomBytes(24).toString("base64url");
}

// Hash de contraseña con scrypt + salt aleatoria. Formato: "scrypt$<salt>$<hash>"
// (ambos en hex). No usamos dependencias externas (bcrypt/argon) para no
// inflar el bundle serverless; scrypt nativo es suficiente para este caso.
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = scryptSync(password, salt, expected.length);
  // timingSafeEqual exige longitudes iguales.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
