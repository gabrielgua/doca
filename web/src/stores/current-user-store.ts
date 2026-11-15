import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { fetchProfile, type Profile } from '@/services/profiles-service'
import { useAuthenticationStore } from '@/stores/authentication-store'

export const useCurrentUserStore = defineStore('current-user', () => {
  const authenticationStore = useAuthenticationStore()

  const profile = ref<Profile | null>(null)
  let profileLoading: Promise<void> | undefined
  let profileLoadingUserId: string | undefined

  const isAdmin = computed(() => profile.value?.isAdmin ?? false)
  const displayName = computed(
    () => profile.value?.fullName ?? authenticationStore.signedInEmail.split('@')[0] ?? '',
  )

  async function loadProfile(userId: string) {
    try {
      profile.value = await fetchProfile(userId)
    } catch {
      profile.value = null
    }
  }

  function ensureProfileLoaded(): Promise<void> {
    const signedInUserId = authenticationStore.signedInUser?.id
    if (!signedInUserId) {
      return Promise.resolve()
    }
    if (!profileLoading || profileLoadingUserId !== signedInUserId) {
      profileLoadingUserId = signedInUserId
      profileLoading = loadProfile(signedInUserId)
    }
    return profileLoading
  }

  function renameLocally(fullName: string) {
    if (profile.value) {
      profile.value = { ...profile.value, fullName }
    }
  }

  watch(
    () => authenticationStore.signedInUser?.id,
    (signedInUserId) => {
      if (signedInUserId) {
        ensureProfileLoaded()
        return
      }
      profileLoading = undefined
      profileLoadingUserId = undefined
      profile.value = null
    },
    { immediate: true },
  )

  return { profile, isAdmin, displayName, ensureProfileLoaded, renameLocally }
})
