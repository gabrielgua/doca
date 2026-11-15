import { supabaseClient } from '@/services/supabase-client'
import type { CompanyColor } from '@/theme/company-colors'

export type CompanyMemberRole = 'manager' | 'client'

export interface Company {
  id: string
  name: string
  cnpj: string | null
  color: CompanyColor
}

export interface CompanyMembership {
  companyId: string
  role: CompanyMemberRole
}

export interface CompanyMember {
  userId: string
  role: CompanyMemberRole
  fullName: string | null
  email: string | null
}

export interface NewCompany {
  name: string
  cnpj: string | null
  color: CompanyColor
}

export interface MemberInvitation {
  companyId: string
  email: string
  fullName: string
  role: CompanyMemberRole
}

export interface MemberInvitationResult {
  wasInviteEmailSent: boolean
}

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabaseClient
    .from('companies')
    .select('id, name, cnpj, color')
    .order('name')
  if (error) {
    throw error
  }
  return data as Company[]
}

export async function fetchOwnMemberships(userId: string): Promise<CompanyMembership[]> {
  const { data, error } = await supabaseClient
    .from('company_members')
    .select('company_id, role')
    .eq('user_id', userId)
  if (error) {
    throw error
  }
  return data.map((membership) => ({
    companyId: membership.company_id,
    role: membership.role as CompanyMemberRole,
  }))
}

export async function createCompany(newCompany: NewCompany): Promise<Company> {
  const { data, error } = await supabaseClient
    .from('companies')
    .insert(newCompany)
    .select('id, name, cnpj, color')
    .single()
  if (error) {
    throw error
  }
  return data as Company
}

export async function updateCompany(
  companyId: string,
  companyChanges: NewCompany,
): Promise<Company> {
  const { data, error } = await supabaseClient
    .from('companies')
    .update(companyChanges)
    .eq('id', companyId)
    .select('id, name, cnpj, color')
    .single()
  if (error) {
    throw error
  }
  return data as Company
}

export interface CompanyAccessSummary {
  members: CompanyMember[]
  brandCount: number
  productCount: number
}

interface MembershipRow {
  company_id: string
  user_id: string
  role: CompanyMemberRole
  profiles: { full_name: string | null; email: string | null } | null
}

function countByCompanyId(rows: { company_id: string }[]): Map<string, number> {
  return rows.reduce((countByCompany, row) => {
    countByCompany.set(row.company_id, (countByCompany.get(row.company_id) ?? 0) + 1)
    return countByCompany
  }, new Map<string, number>())
}

export async function fetchCompanyAccessSummaries(
  companyIds: string[],
): Promise<Map<string, CompanyAccessSummary>> {
  const [membershipsResult, brandsResult, productsResult] = await Promise.all([
    supabaseClient
      .from('company_members')
      .select('company_id, user_id, role, profiles(full_name, email)')
      .in('company_id', companyIds)
      .order('created_at'),
    supabaseClient.from('brands').select('company_id').in('company_id', companyIds),
    supabaseClient.from('products').select('company_id').in('company_id', companyIds),
  ])
  if (membershipsResult.error) {
    throw membershipsResult.error
  }
  if (brandsResult.error) {
    throw brandsResult.error
  }
  if (productsResult.error) {
    throw productsResult.error
  }
  const brandCountByCompanyId = countByCompanyId(brandsResult.data)
  const productCountByCompanyId = countByCompanyId(productsResult.data)
  const memberships = membershipsResult.data as unknown as MembershipRow[]
  return new Map(
    companyIds.map((companyId) => [
      companyId,
      {
        members: memberships
          .filter((membership) => membership.company_id === companyId)
          .map((membership) => ({
            userId: membership.user_id,
            role: membership.role,
            fullName: membership.profiles?.full_name ?? null,
            email: membership.profiles?.email ?? null,
          })),
        brandCount: brandCountByCompanyId.get(companyId) ?? 0,
        productCount: productCountByCompanyId.get(companyId) ?? 0,
      },
    ]),
  )
}

export function formatCnpj(cnpjDigits: string): string {
  return cnpjDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export async function unlinkCompanyMember(companyId: string, userId: string) {
  const { error } = await supabaseClient
    .from('company_members')
    .delete()
    .eq('company_id', companyId)
    .eq('user_id', userId)
  if (error) {
    throw error
  }
}

export async function inviteCompanyMember(
  invitation: MemberInvitation,
): Promise<MemberInvitationResult> {
  const { data, error } = await supabaseClient.functions.invoke<MemberInvitationResult>(
    'invite-member',
    {
      body: { ...invitation, redirectTo: `${window.location.origin}/set-password` },
    },
  )
  if (error) {
    const errorContext = (error as { context?: Response }).context
    const errorBody = await errorContext?.json().catch(() => null)
    throw new Error(errorBody?.error ?? 'invite_failed')
  }
  return { wasInviteEmailSent: data?.wasInviteEmailSent ?? false }
}
