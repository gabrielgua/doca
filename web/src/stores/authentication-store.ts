import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabaseClient } from '@/services/supabase-client'

export const useAuthenticationStore = defineStore('authentication', () => {
  const session = ref<Session | null>(null)
  const hasRestoredSession = ref(false)
  let sessionRestoration: Promise<void> | undefined

  const signedInUser = computed(() => session.value?.user ?? null)
  const isSignedIn = computed(() => signedInUser.value !== null)
  const signedInEmail = computed(() => signedInUser.value?.email ?? '')

  async function loadSession() {
    supabaseClient.auth.onAuthStateChange((_event, changedSession) => {
      session.value = changedSession
    })
    const { data } = await supabaseClient.auth.getSession()
    session.value = data.session
    hasRestoredSession.value = true
  }

  function restoreSession(): Promise<void> {
    sessionRestoration ??= loadSession()
    return sessionRestoration
  }

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }
  }

  async function sendSignInLink(email: string) {
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
    })
    if (error) {
      throw error
    }
  }

  async function signOut() {
    await supabaseClient.auth.signOut()
  }

  return {
    hasRestoredSession,
    signedInUser,
    isSignedIn,
    signedInEmail,
    restoreSession,
    signInWithPassword,
    sendSignInLink,
    signOut,
  }
})
