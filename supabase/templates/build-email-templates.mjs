import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUTPUT_DIRECTORY = dirname(fileURLToPath(import.meta.url))

const GREETING = '{{ if .Data.full_name }}Oi, {{ .Data.full_name }}!{{ else }}Oi!{{ end }}'

const EMAILS = [
  {
    fileName: 'invite',
    emoji: '📦',
    title: 'Abriram a porta da Doca pra você',
    paragraphs: [
      GREETING,
      'Alguém da equipe te chamou pra acompanhar os envios pra Amazon por aqui. Falta só criar sua senha, e prometo que é mais rápido que fechar uma caixa com fita.',
    ],
    buttonLabel: 'Criar minha senha',
    note: 'Não esperava esse convite? Pode ignorar, a gente não fica chateado.',
  },
  {
    fileName: 'magic-link',
    emoji: '✨',
    title: 'Toc, toc! É o seu link de entrada',
    paragraphs: ['Um clique no botão e você já está dentro. Sem senha, sem drama.'],
    buttonLabel: 'Entrar na Doca',
    note: 'O link vale por 1 hora e só funciona uma vez. Não pediu? É só ignorar.',
  },
  {
    fileName: 'recovery',
    emoji: '🔑',
    title: 'Senha sumiu? Acontece com os melhores',
    paragraphs: ['Clique no botão pra criar uma senha nova e voltar pros seus envios.'],
    buttonLabel: 'Criar senha nova',
    note: 'Se não foi você, tudo certo: sua senha atual continua valendo.',
  },
  {
    fileName: 'email-change',
    emoji: '📬',
    title: 'Endereço novo, quem diria',
    paragraphs: [
      'Você pediu pra trocar <strong>{{ .Email }}</strong> por <strong>{{ .NewEmail }}</strong>. Só confirma pra gente saber que foi você mesmo.',
    ],
    buttonLabel: 'Confirmar troca',
    note: 'Não pediu essa troca? Ignore este email e nada muda.',
  },
  {
    fileName: 'confirmation',
    emoji: '👋',
    title: 'Confirma que é você?',
    paragraphs: [
      'Falta um clique pra ativar sua conta na Doca. Depois disso, é só caixa saindo e chegando.',
    ],
    buttonLabel: 'Confirmar email',
    note: 'Não criou conta nenhuma? Pode ignorar este email.',
  },
  {
    fileName: 'reauthentication',
    emoji: '🛡️',
    title: 'Só conferindo se é você mesmo',
    paragraphs: ['Use este código pra confirmar a ação que você pediu na Doca:'],
    code: '{{ .Token }}',
    note: 'O código expira rapidinho. Não foi você? Ignore e troque sua senha.',
  },
]

const COLORS = {
  page: '#eef5fb',
  card: '#ffffff',
  border: '#e2e8f0',
  heading: '#0f172a',
  body: '#475569',
  muted: '#94a3b8',
  brand: '#0284c7',
  brandSoft: '#e0f2fe',
}

const FONT_STACK =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

function renderButton(label) {
  return `
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0 0;">
            <tr>
              <td style="border-radius: 14px; background: ${COLORS.brand};">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 26px; font-family: ${FONT_STACK}; font-size: 15px; font-weight: 800; color: #ffffff; text-decoration: none; border-radius: 14px;">${label} &rarr;</a>
              </td>
            </tr>
          </table>
          <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.6; color: ${COLORS.muted};">
            Botão tímido? Copie e cole no navegador:<br />
            <a href="{{ .ConfirmationURL }}" style="color: ${COLORS.brand}; word-break: break-all;">{{ .ConfirmationURL }}</a>
          </p>`
}

function renderCode(code) {
  return `
          <p style="margin: 24px 0 0; padding: 18px; border-radius: 18px; background: ${COLORS.brandSoft}; text-align: center; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: ${COLORS.brand};">${code}</p>`
}

function renderEmail(email) {
  const paragraphs = email.paragraphs
    .map(
      (paragraph, position) =>
        `<p style="margin: ${position === 0 ? '12px' : '10px'} 0 0; font-size: 15px; line-height: 1.6; color: ${COLORS.body};">${paragraph}</p>`,
    )
    .join('\n          ')
  const action = email.code ? renderCode(email.code) : renderButton(email.buttonLabel)
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${email.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;800&display=swap" rel="stylesheet" />
  </head>
  <body style="margin: 0; padding: 0; background: ${COLORS.page}; font-family: ${FONT_STACK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${COLORS.page};">
      <tr>
        <td align="center" style="padding: 36px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
            <tr>
              <td style="padding: 0 4px 18px; font-size: 18px; font-weight: 800; letter-spacing: -0.02em; color: ${COLORS.heading};">
                <span style="display: inline-block; width: 30px; height: 30px; margin-right: 6px; border-radius: 10px; background: ${COLORS.brand}; color: #ffffff; text-align: center; line-height: 30px; font-size: 16px; vertical-align: middle;">d</span>
                <span style="vertical-align: middle;">doca</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px; border: 1px solid ${COLORS.border}; border-radius: 24px; background: ${COLORS.card};">
                <div style="width: 56px; height: 56px; border-radius: 18px; background: ${COLORS.brandSoft}; text-align: center; line-height: 56px; font-size: 28px;">${email.emoji}</div>
                <h1 style="margin: 20px 0 0; font-size: 22px; line-height: 1.3; font-weight: 800; letter-spacing: -0.02em; color: ${COLORS.heading};">${email.title}</h1>
          ${paragraphs}
          ${action}
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 8px 0; font-size: 12px; line-height: 1.6; color: ${COLORS.muted}; text-align: center;">
                ${email.note}<br />
                Doca · envios pra Amazon sem dor de cabeça
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

for (const email of EMAILS) {
  writeFileSync(join(OUTPUT_DIRECTORY, `${email.fileName}.html`), renderEmail(email))
}
