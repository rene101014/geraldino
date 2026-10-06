// Construcción de un correo MIME crudo (RFC 5322) para enviarlo por SES con
// SendEmail/Raw. Lo hacemos crudo (en vez del contenido "Simple" de SES) para
// poder incluir la cabecera List-Unsubscribe + List-Unsubscribe-Post, que Gmail
// y Yahoo exigen a quien envía en volumen y mejora mucho la entregabilidad.

// Codifica una cabecera con caracteres no-ASCII (acentos, ñ) según RFC 2047.
function encodeHeaderValue(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

// Parte el base64 en líneas de 76 caracteres (requisito MIME).
function chunk76(base64: string): string {
  return base64.replace(/(.{76})/g, "$1\r\n");
}

function base64Part(body: string): string {
  return chunk76(Buffer.from(body, "utf8").toString("base64"));
}

export interface BuildRawEmailParams {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  // URL de baja con un clic; va en el enlace del cuerpo y en la cabecera.
  unsubscribeUrl: string;
}

export function buildRawEmail(params: BuildRawEmailParams): string {
  const boundary = `--_geraldino_${Math.random().toString(36).slice(2)}`;
  const from = `${encodeHeaderValue(params.fromName)} <${params.fromEmail}>`;

  const headers = [
    `From: ${from}`,
    `To: ${params.to}`,
    `Subject: ${encodeHeaderValue(params.subject)}`,
    params.replyTo ? `Reply-To: ${params.replyTo}` : null,
    `List-Unsubscribe: <${params.unsubscribeUrl}>`,
    `List-Unsubscribe-Post: List-Unsubscribe=One-Click`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean);

  const body = [
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Part(params.text),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    base64Part(params.html),
    "",
    `--${boundary}--`,
    "",
  ];

  return [...headers, "", ...body].join("\r\n");
}

// Deriva una versión texto plano mínima desde el HTML (quita etiquetas).
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
