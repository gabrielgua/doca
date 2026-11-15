import { useCompaniesStore } from '@/stores/companies-store'
import { useCurrentUserStore } from '@/stores/current-user-store'

export type RouteAudience = 'everyone' | 'editors' | 'people-linkers' | 'admins'

export function useRouteAudienceAccess() {
  const companiesStore = useCompaniesStore()
  const currentUserStore = useCurrentUserStore()

  function isAudienceAllowed(audience: RouteAudience = 'everyone'): boolean {
    const isAllowedByAudience: Record<RouteAudience, boolean> = {
      everyone: true,
      editors: companiesStore.canEditCurrentCompany,
      'people-linkers': companiesStore.canLinkPeople,
      admins: currentUserStore.isAdmin,
    }
    return isAllowedByAudience[audience]
  }

  async function waitForAccessData() {
    await Promise.all([
      currentUserStore.ensureProfileLoaded(),
      companiesStore.ensureCompaniesLoaded(),
    ])
  }

  return { isAudienceAllowed, waitForAccessData }
}
