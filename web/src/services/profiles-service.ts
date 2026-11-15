import { supabaseClient } from '@/services/supabase-client'

export interface Profile {
  id: string
  fullName: string | null
  isAdmin: boolean
}

export interface OwnAccountUpdate {
  fullName: string
  password: string
}

export async function updateOwnAccount(accountUpdate: OwnAccountUpdate) {
  const { data, error } = await supabaseClient.auth.updateUser({
    password: accountUpdate.password,
    data: { full_name: accountUpdate.fullName },
  })
  if (error) {
    throw error
  }
  const { error: profileError } = await supabaseClient
    .from('profiles')
    .update({ full_name: accountUpdate.fullName })
    .eq('id', data.user.id)
  if (profileError) {
    throw profileError
  }
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, is_admin')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    throw error
  }
  if (!data) {
    return null
  }
  return { id: data.id, fullName: data.full_name, isAdmin: data.is_admin }
}
