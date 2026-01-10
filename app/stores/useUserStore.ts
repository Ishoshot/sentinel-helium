import type { User } from '~/types'

interface UserState {
  user: User | null
}

/**
 * User store - manages authenticated user state
 * Minimal store: only holds current user session
 */
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)
  const displayName = computed(() => user.value?.name ?? '')
  const avatarUrl = computed(() => user.value?.avatar_url ?? null)
  const email = computed(() => user.value?.email ?? '')

  // Actions
  function setUser(newUser: User) {
    user.value = newUser
  }

  function clearUser() {
    user.value = null
  }

  return {
    // State
    user,
    // Getters
    isAuthenticated,
    displayName,
    avatarUrl,
    email,
    // Actions
    setUser,
    clearUser,
  }
})
