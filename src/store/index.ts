import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// User related state
interface UserState {
  user: {
    id: string | null
    name: string | null
    email: string | null
    avatar?: string
  } | null
  isAuthenticated: boolean
  preferences: {
    notifications: boolean
    locationTracking: boolean
    theme: 'light' | 'dark' | 'system'
  }
}

interface UserActions {
  setUser: (user: UserState['user']) => void
  clearUser: () => void
  updatePreferences: (preferences: Partial<UserState['preferences']>) => void
}

// Animal related state
interface AnimalState {
  selectedAnimal: {
    id: string | null
    name: string | null
    species: string | null
  } | null
  filters: {
    species?: string
    location?: string
    status?: 'missing' | 'found' | 'unknown'
    dateRange?: {
      start: string
      end: string
    }
  }
  searchQuery: string
}

interface AnimalActions {
  setSelectedAnimal: (animal: AnimalState['selectedAnimal']) => void
  clearSelectedAnimal: () => void
  updateFilters: (filters: Partial<AnimalState['filters']>) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void
}

// UI state
interface UiState {
  isLoading: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>
  modals: {
    animalForm: boolean
    sightingForm: boolean
    userProfile: boolean
  }
  sidebarOpen: boolean
}

interface UiActions {
  setLoading: (loading: boolean) => void
  addNotification: (
    notification: Omit<UiState['notifications'][0], 'id'>
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setModal: (modal: keyof UiState['modals'], open: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

// Combined store
type Store = UserState &
  UserActions &
  AnimalState &
  AnimalActions &
  UiState &
  UiActions

export const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        // User state
        user: null,
        isAuthenticated: false,
        preferences: {
          notifications: true,
          locationTracking: true,
          theme: 'system' as const,
        },

        // Animal state
        selectedAnimal: null,
        filters: {},
        searchQuery: '',

        // UI state
        isLoading: false,
        notifications: [],
        modals: {
          animalForm: false,
          sightingForm: false,
          userProfile: false,
        },
        sidebarOpen: false,

        // Actions
        setUser: user => set({ user, isAuthenticated: !!user }),

        clearUser: () =>
          set({
            user: null,
            isAuthenticated: false,
          }),

        updatePreferences: preferences =>
          set(state => ({
            preferences: { ...state.preferences, ...preferences },
          })),

        setSelectedAnimal: animal => set({ selectedAnimal: animal }),

        clearSelectedAnimal: () => set({ selectedAnimal: null }),

        updateFilters: filters =>
          set(state => ({
            filters: { ...state.filters, ...filters },
          })),

        setSearchQuery: query => set({ searchQuery: query }),

        clearFilters: () => set({ filters: {} }),

        setLoading: isLoading => set({ isLoading }),

        addNotification: notification =>
          set(state => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: Math.random().toString(36).substr(2, 9),
              },
            ],
          })),

        removeNotification: id =>
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
          })),

        clearNotifications: () => set({ notifications: [] }),

        setModal: (modal, open) =>
          set(state => ({
            modals: { ...state.modals, [modal]: open },
          })),

        setSidebarOpen: sidebarOpen => set({ sidebarOpen }),
      }),
      {
        name: 'stray-tracker-store',
        partialize: state => ({
          user: state.user,
          preferences: state.preferences,
          filters: state.filters,
        }),
      }
    ),
    {
      name: 'stray-tracker',
    }
  )
)

// Selectors for better performance
export const useAuth = () =>
  useStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }))

export const useUserPreferences = () => useStore(state => state.preferences)

export const useAnimalFilters = () => useStore(state => state.filters)

export const useSearchQuery = () => useStore(state => state.searchQuery)

export const useUIState = () =>
  useStore(state => ({
    isLoading: state.isLoading,
    notifications: state.notifications,
    modals: state.modals,
    sidebarOpen: state.sidebarOpen,
  }))
