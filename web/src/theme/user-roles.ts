export type UserRole = 'admin' | 'manager' | 'client'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Gerente',
  client: 'Cliente',
}
