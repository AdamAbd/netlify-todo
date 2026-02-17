import { authClient } from '@/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.getSession()

  if (!session) {
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
  }
})
