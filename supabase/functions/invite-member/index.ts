import { createClient } from 'npm:@supabase/supabase-js@2.118.0'

type CompanyRole = 'manager' | 'client'

interface InviteMemberRequest {
  companyId: string
  email: string
  fullName?: string
  role: CompanyRole
  redirectTo: string
}

type InviteMemberErrorCode =
  | 'not_signed_in'
  | 'invalid_request'
  | 'not_allowed'
  | 'already_member'
  | 'invite_failed'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const COMPANY_ROLES: CompanyRole[] = ['manager', 'client']

function respondWithJson(status: number, responseBody: Record<string, unknown>): Response {
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function respondWithError(status: number, errorCode: InviteMemberErrorCode): Response {
  return respondWithJson(status, { error: errorCode })
}

function readInviteRequest(requestBody: unknown): InviteMemberRequest | null {
  if (typeof requestBody !== 'object' || requestBody === null) {
    return null
  }
  const candidate = requestBody as Record<string, unknown>
  const isValid =
    typeof candidate.companyId === 'string' &&
    UUID_PATTERN.test(candidate.companyId) &&
    typeof candidate.email === 'string' &&
    EMAIL_PATTERN.test(candidate.email.trim()) &&
    typeof candidate.role === 'string' &&
    COMPANY_ROLES.includes(candidate.role as CompanyRole) &&
    typeof candidate.redirectTo === 'string' &&
    (candidate.fullName === undefined || typeof candidate.fullName === 'string')
  if (!isValid) {
    return null
  }
  return {
    companyId: candidate.companyId as string,
    email: (candidate.email as string).trim().toLowerCase(),
    fullName: (candidate.fullName as string | undefined)?.trim() || undefined,
    role: candidate.role as CompanyRole,
    redirectTo: candidate.redirectTo as string,
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: request.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  })
  const {
    data: { user: caller },
  } = await callerClient.auth.getUser()
  if (!caller) {
    return respondWithError(401, 'not_signed_in')
  }

  const inviteRequest = readInviteRequest(await request.json().catch(() => null))
  if (!inviteRequest) {
    return respondWithError(400, 'invalid_request')
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const [{ data: callerProfile }, { data: callerMembership }] = await Promise.all([
    adminClient.from('profiles').select('is_admin').eq('id', caller.id).maybeSingle(),
    adminClient
      .from('company_members')
      .select('role')
      .eq('company_id', inviteRequest.companyId)
      .eq('user_id', caller.id)
      .maybeSingle(),
  ])
  const canLinkPeople = callerProfile?.is_admin === true || callerMembership?.role === 'manager'
  if (!canLinkPeople) {
    return respondWithError(403, 'not_allowed')
  }

  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', inviteRequest.email)
    .maybeSingle()

  let invitedUserId = existingProfile?.id as string | undefined
  let wasInviteEmailSent = false

  if (invitedUserId) {
    const { data: existingMembership } = await adminClient
      .from('company_members')
      .select('role')
      .eq('company_id', inviteRequest.companyId)
      .eq('user_id', invitedUserId)
      .maybeSingle()
    if (existingMembership) {
      return respondWithError(409, 'already_member')
    }
  } else {
    const { data: invitation, error: invitationError } =
      await adminClient.auth.admin.inviteUserByEmail(inviteRequest.email, {
        data: inviteRequest.fullName ? { full_name: inviteRequest.fullName } : undefined,
        redirectTo: inviteRequest.redirectTo,
      })
    if (invitationError || !invitation.user) {
      return respondWithJson(400, { error: 'invite_failed', message: invitationError?.message })
    }
    invitedUserId = invitation.user.id
    wasInviteEmailSent = true
  }

  const { error: membershipError } = await adminClient.from('company_members').insert({
    company_id: inviteRequest.companyId,
    user_id: invitedUserId,
    role: inviteRequest.role,
  })
  if (membershipError) {
    return respondWithJson(400, { error: 'invite_failed', message: membershipError.message })
  }

  return respondWithJson(200, { userId: invitedUserId, wasInviteEmailSent })
})
