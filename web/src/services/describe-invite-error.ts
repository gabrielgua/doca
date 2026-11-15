const INVITE_MESSAGES_BY_ERROR_CODE: Record<string, string> = {
  not_signed_in: 'Sua sessão expirou. Entre de novo para convidar.',
  invalid_request: 'Confira o email e o papel e tente de novo.',
  not_allowed: 'Você só pode vincular pessoas às empresas em que é gerente.',
  already_member: 'Essa pessoa já está vinculada a esta empresa.',
  invite_failed: 'Não foi possível enviar o convite. Tente de novo em alguns minutos.',
}

const FALLBACK_INVITE_MESSAGE = 'Não foi possível enviar o convite. Tente de novo.'

export function describeInviteError(unknownError: unknown): string {
  if (unknownError instanceof Error) {
    return INVITE_MESSAGES_BY_ERROR_CODE[unknownError.message] ?? FALLBACK_INVITE_MESSAGE
  }
  return FALLBACK_INVITE_MESSAGE
}
