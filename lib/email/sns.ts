import crypto from "node:crypto";

// Verificación de mensajes de Amazon SNS. El webhook es una URL pública, así que
// NUNCA confiamos en el cuerpo sin antes comprobar la firma criptográfica de AWS.
// Sin esta verificación, cualquiera podría inyectar eventos falsos.

export interface SnsMessage {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  Token?: string;
  SubscribeURL?: string;
  UnsubscribeURL?: string;
}

// El certificado solo puede venir de un host de AWS. Bloquea URLs falsificadas.
function isValidCertUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      /^sns\.[a-z0-9-]+\.amazonaws\.com$/.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

// Campos que entran en la firma, según el tipo de mensaje y en orden exacto.
function stringToSign(msg: SnsMessage): string {
  const fields =
    msg.Type === "Notification"
      ? ["Message", "MessageId", "Subject", "Timestamp", "TopicArn", "Type"]
      : ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"];

  let out = "";
  for (const key of fields) {
    const value = (msg as unknown as Record<string, string | undefined>)[key];
    if (value === undefined) continue; // Subject es opcional.
    out += `${key}\n${value}\n`;
  }
  return out;
}

const certCache = new Map<string, string>();

async function fetchCert(url: string): Promise<string> {
  const cached = certCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar el certificado SNS (${res.status})`);
  const pem = await res.text();
  certCache.set(url, pem);
  return pem;
}

// Devuelve true solo si la firma es válida y el certificado es de AWS.
export async function verifySnsSignature(msg: SnsMessage): Promise<boolean> {
  if (!isValidCertUrl(msg.SigningCertURL)) return false;

  const algorithm = msg.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1";
  const pem = await fetchCert(msg.SigningCertURL);

  const verifier = crypto.createVerify(algorithm);
  verifier.update(stringToSign(msg), "utf8");
  try {
    return verifier.verify(pem, msg.Signature, "base64");
  } catch {
    return false;
  }
}

// Confirma la suscripción del topic SNS visitando la SubscribeURL (solo una vez,
// cuando AWS envía el primer mensaje SubscriptionConfirmation).
export async function confirmSubscription(msg: SnsMessage): Promise<void> {
  if (!msg.SubscribeURL) return;
  if (!isValidCertUrl(msg.SigningCertURL)) return;
  await fetch(msg.SubscribeURL);
}
