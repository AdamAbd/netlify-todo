export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Skip middleware while loading auth state
  if (isLoading.value) return

  if (isAuthenticated.value) {
    return navigateTo('/home', { replace: true })
  }
})
