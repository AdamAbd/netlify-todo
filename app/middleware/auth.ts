export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect to login while auth state is loading or user is not authenticated
  if (isLoading.value || !isAuthenticated.value) {
    return navigateTo('/login', { replace: true })
  }
})
