import { isAuthError } from '@supabase/supabase-js'

const SIGN_IN_MESSAGES_BY_ERROR_CODE: Record<string, string> = {
  invalid_credentials: 'Email ou senha incorretos.',
  user_not_found: 'Esse email ainda não tem acesso à Doca. Peça um convite a quem administra.',
  otp_disabled: 'Esse email ainda não tem acesso à Doca. Peça um convite a quem administra.',
  signup_disabled: 'Esse email ainda não tem acesso à Doca. Peça um convite a quem administra.',
  email_not_confirmed: 'Confirme o seu email pelo link do convite antes de entrar.',
  over_email_send_rate_limit: 'Muitos pedidos seguidos. Espere um minuto e tente de novo.',
  over_request_rate_limit: 'Muitas tentativas seguidas. Espere um minuto e tente de novo.',
}

const FALLBACK_SIGN_IN_MESSAGE = 'Não foi possível entrar agora. Tente de novo em instantes.'

export function describeSignInError(unknownError: unknown): string {
  if (isAuthError(unknownError) && unknownError.code) {
    return SIGN_IN_MESSAGES_BY_ERROR_CODE[unknownError.code] ?? FALLBACK_SIGN_IN_MESSAGE
  }
  return FALLBACK_SIGN_IN_MESSAGE
}
