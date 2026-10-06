# Mail-room (email marketing propio con Amazon SES)

Sistema de email marketing integrado en el sitio: captura de suscriptores,
campañas, envío por lotes y estadísticas (aperturas, clics, rebotes, bajas).
Sin cuota por suscriptor — pagas solo a SES (~$0.10 USD / 1.000 correos).

## Qué se construyó (ya en el código)

- **Base de datos** — `supabase/migrations/20261006120000_email_marketing.sql`
  Tablas: `email_contacts`, `email_lists`, `email_list_contacts`,
  `email_campaigns`, `email_sends`, `email_events`. RLS admin + alta pública.
- **Envío** — `lib/email/` (`ses.ts`, `mime.ts`, `campaign.ts`). Construye el
  correo con cabecera `List-Unsubscribe` y envía por SES en lotes.
- **Rutas**:
  - `GET /api/email/send` — worker por lotes (lo dispara el cron de Vercel).
  - `POST /api/email/webhook` — recibe eventos de SES vía SNS (firma verificada).
  - `/unsubscribe/[token]` — baja (enlace del correo + un clic de Gmail/Yahoo).
- **Panel admin**: `/admin/suscriptores` y `/admin/campanas` (crear, enviar, ver
  estadísticas por campaña).
- **Cron** — `vercel.json` llama a `/api/email/send` cada minuto.

## Pasos para ponerlo en marcha

### 1. Aplicar la migración a Supabase
```bash
supabase db push
```
(o pega el SQL de la migración en el SQL Editor del panel de Supabase).

### 2. Amazon SES
1. Crea cuenta AWS y entra a **SES** en una región (ej. `us-east-1`).
2. **Verifica tu dominio**: SES → *Identities* → *Create identity* → *Domain*.
   Agrega a tu DNS los registros **DKIM (CNAME)**, **SPF** y el **MAIL FROM**
   que te da SES. Espera a que quede "Verified".
3. **Sal del sandbox**: SES → *Account dashboard* → *Request production access*.
   Explica que tienes consentimiento y enlace de baja. (En sandbox solo puedes
   enviarte a direcciones verificadas por ti.)
4. **Usuario IAM** con permiso `ses:SendEmail` → genera *Access key* + *Secret*.
5. **Configuration Set** (ej. `geraldino-mailroom`):
   - Activa **Open tracking** y **Click tracking**.
   - *Event destinations* → nuevo destino a **SNS**, con los eventos:
     `Send, Delivery, Open, Click, Bounce, Complaint`.
6. **SNS**: crea un *topic*, y una suscripción **HTTPS** apuntando a
   `https://TU-DOMINIO/api/email/webhook`. El webhook confirma la suscripción
   solo (verifica la firma de AWS automáticamente).

### 3. Variables de entorno (en Vercel y en `.env.local`)
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SES_CONFIGURATION_SET=geraldino-mailroom
EMAIL_FROM_NAME=Geraldino
EMAIL_FROM_EMAIL=hola@tudominio.com        # debe estar verificado en SES
EMAIL_BATCH_SIZE=30                         # opcional
CRON_SECRET=<cadena-aleatoria-larga>        # Vercel la usa para proteger el cron
```

### 4. Desplegar
```bash
git add -A && git commit -m "feat: mail-room email marketing con SES" && git push
```
Vercel construye y activa el cron. **Nota:** el cron por minuto requiere plan
**Vercel Pro**. Después del deploy, crea la suscripción SNS al webhook en vivo.

## Cómo se usa
1. `/admin/suscriptores` — agrega o importa contactos (un email por línea).
2. `/admin/campanas` → *Nueva campaña* — asunto, remitente y cuerpo HTML.
   Variables: `{{name}}`, `{{email}}`, `{{unsubscribe_url}}`.
3. Guarda el borrador → *Enviar ahora*. El cron envía por lotes.
4. Abre la campaña para ver entregados, aperturas, clics, rebotes y bajas.

## Notas importantes
- **Legal**: incluye siempre el enlace de baja (se añade en la cabecera aunque
  olvides `{{unsubscribe_url}}`) y nunca importes listas sin consentimiento —
  SES suspende la cuenta por quejas de spam.
- **Aperturas**: orientativas (Apple Mail las infla). Los **clics** son la
  métrica confiable.
- **Cambiar a Resend** después: misma arquitectura; solo cambia `lib/email/ses.ts`.
