import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authentication-store'
import { useToastStore } from '@/stores/toast-store'
import { useRouteAudienceAccess, type RouteAudience } from './route-audience'

declare module 'vue-router' {
  interface RouteMeta {
    isPublic?: boolean
    pageTitle?: string
    isAdministrationPage?: boolean
    navigationRouteName?: string
    audience?: RouteAudience
    isPageHeaderHidden?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'sign-in',
      path: '/sign-in',
      component: () => import('@/views/SignInView.vue'),
      meta: { isPublic: true, pageTitle: 'Entrar' },
    },
    {
      name: 'set-password',
      path: '/set-password',
      component: () => import('@/views/SetPasswordView.vue'),
      meta: { pageTitle: 'Definir senha' },
    },
    {
      path: '/',
      component: () => import('@/views/AppLayoutView.vue'),
      children: [
        {
          name: 'home',
          path: '',
          component: () => import('@/views/HomeView.vue'),
          meta: { pageTitle: 'Início' },
        },
        {
          name: 'shipments',
          path: 'shipments',
          component: () => import('@/views/ShipmentsView.vue'),
          meta: { pageTitle: 'Envios' },
        },
        {
          name: 'new-shipment',
          path: 'shipments/new',
          component: () => import('@/views/NewShipmentView.vue'),
          meta: { pageTitle: 'Novo envio', audience: 'editors' },
        },
        {
          name: 'catalog',
          path: 'catalog',
          component: () => import('@/views/CatalogView.vue'),
          meta: { pageTitle: 'Marcas e produtos' },
        },
        {
          name: 'companies',
          path: 'companies',
          component: () => import('@/views/CompaniesView.vue'),
          meta: { pageTitle: 'Empresas', isAdministrationPage: true, audience: 'people-linkers' },
        },
        {
          name: 'company-overview',
          path: 'companies/:companyId',
          component: () => import('@/views/CompanyOverviewView.vue'),
          meta: {
            pageTitle: 'Empresa',
            isAdministrationPage: true,
            navigationRouteName: 'companies',
            audience: 'people-linkers',
          },
        },
        {
          name: 'component-gallery',
          path: 'components',
          component: () => import('@/views/ComponentGalleryView.vue'),
          meta: { pageTitle: 'Componentes', isAdministrationPage: true, audience: 'admins' },
        },
        {
          name: 'amazon',
          path: 'amazon',
          component: () => import('@/views/AmazonView.vue'),
          meta: { pageTitle: 'Amazon' },
        },
        {
          name: 'forbidden',
          path: 'forbidden',
          component: () => import('@/views/ForbiddenView.vue'),
          meta: { pageTitle: 'Sem acesso', isPageHeaderHidden: true },
        },
        {
          name: 'not-found',
          path: ':pathMatch(.*)*',
          component: () => import('@/views/NotFoundView.vue'),
          meta: { pageTitle: 'Página não encontrada', isPageHeaderHidden: true },
        },
      ],
    },
    {
      path: '/definir-senha',
      redirect: (destination) => ({
        name: 'set-password',
        query: destination.query,
        hash: destination.hash,
      }),
    },
  ],
})

router.beforeEach(async (destination) => {
  const authenticationStore = useAuthenticationStore()
  await authenticationStore.restoreSession()
  const isPublicDestination = destination.matched.some((matchedRoute) => matchedRoute.meta.isPublic)
  if (!isPublicDestination && !authenticationStore.isSignedIn) {
    return { name: 'sign-in', query: { redirect: destination.fullPath } }
  }
  if (destination.name === 'sign-in' && authenticationStore.isSignedIn) {
    return { name: 'home' }
  }
  const audience = destination.meta.audience
  if (audience && audience !== 'everyone') {
    const { isAudienceAllowed, waitForAccessData } = useRouteAudienceAccess()
    await waitForAccessData()
    if (!isAudienceAllowed(audience)) {
      useToastStore().showToast({
        tone: 'warning',
        title: 'Essa página não é pra você',
        description: 'Te trouxemos de volta pro início.',
      })
      return { name: 'home' }
    }
  }
  return true
})

router.afterEach((destination) => {
  const pageTitle = destination.meta.pageTitle
  document.title = pageTitle ? `${pageTitle} · Doca` : 'Doca'
})

export default router
