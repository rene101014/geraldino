import {
  SESv2Client,
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import { buildRawEmail } from "@/lib/email/mime";

// Cliente SES (v2). Las credenciales salen del entorno (AWS_ACCESS_KEY_ID,
// AWS_SECRET_ACCESS_KEY, AWS_REGION) — un usuario IAM con permiso solo de
// ses:SendEmail. Nunca se exponen al navegador.
let client: SESv2Client | null = null;

function getClient(): SESv2Client {
  if (client) return client;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Faltan AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY en el entorno.",
    );
  }
  client = new SESv2Client({ region, credentials: { accessKeyId, secretAccessKey } });
  return client;
}

export interface SendEmailParams {
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  unsubscribeUrl: string;
}

// Envía un correo y devuelve el MessageId de SES. Ese mismo id llega después en
// las notificaciones de SNS (mail.messageId), así se casan los eventos con el
// envío en email_sends.
export async function sendEmail(params: SendEmailParams): Promise<string> {
  const configurationSet = process.env.SES_CONFIGURATION_SET;
  const raw = buildRawEmail(params);

  const command = new SendEmailCommand({
    // En modo Raw el remitente y destinatario van en las cabeceras del MIME,
    // pero SES pide igualmente el Destination.
    Destination: { ToAddresses: [params.to] },
    // El Configuration Set activa el seguimiento de aperturas/clics y la
    // publicación de eventos a SNS.
    ConfigurationSetName: configurationSet,
    Content: {
      Raw: { Data: new TextEncoder().encode(raw) },
    },
  });

  const res = await getClient().send(command);
  if (!res.MessageId) {
    throw new Error("SES no devolvió MessageId");
  }
  return res.MessageId;
}
