export interface User {
  id: string
  email: string
  name: string
  image?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth() {
  const authState = useState<AuthState>('auth', () => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  }))

  const login = async (email: string, password: string) => {
    authState.value.isLoading = true
    try {
      // TODO: Replace with actual Better Auth API call
      const data = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      authState.value.user = data.user
      authState.value.isAuthenticated = true
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Login failed. Please try again.',
      }
    } finally {
      authState.value.isLoading = false
    }
  }

  const register = async (name: string, email: string, password: string) => {
    authState.value.isLoading = true
    try {
      // TODO: Replace with actual Better Auth API call
      const data = await $fetch<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })
      authState.value.user = data.user
      authState.value.isAuthenticated = true
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Registration failed. Please try again.',
      }
    } finally {
      authState.value.isLoading = false
    }
  }

  const loginWithGoogle = async () => {
    // TODO: Replace with actual Better Auth Google OAuth flow
    window.location.href = '/api/auth/google'
  }

  const forgotPassword = async (email: string) => {
    try {
      await $fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Failed to send reset email.',
      }
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      await $fetch('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || 'Failed to reset password.',
      }
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      authState.value.user = null
      authState.value.isAuthenticated = false
    }
  }

  const fetchUser = async () => {
    authState.value.isLoading = true
    try {
      const data = await $fetch<{ user: User }>('/api/auth/session')
      authState.value.user = data.user
      authState.value.isAuthenticated = true
    } catch {
      authState.value.user = null
      authState.value.isAuthenticated = false
    } finally {
      authState.value.isLoading = false
    }
  }

  return {
    authState,
    user: computed(() => authState.value.user),
    isAuthenticated: computed(() => authState.value.isAuthenticated),
    isLoading: computed(() => authState.value.isLoading),
    login,
    register,
    loginWithGoogle,
    forgotPassword,
    resetPassword,
    logout,
    fetchUser,
  }
}
