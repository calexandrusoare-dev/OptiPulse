import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { supabase } from "../api/supabaseClient"
import { Session } from "@supabase/supabase-js"
import { AuthContextType, UserPermission, User } from "@/core/types"

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider Component
 * Manages authentication state and user permissions
 * Fetches permissions from core.v_user_permissions view
 */
export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  permissions: [],
  loading: true,
  isAuthenticated: false,
  refreshPermissions: async () => {},
  hasRole: () => false,
  hasPermission: () => false,
  logout: async () => {},
})

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<string[]>([])
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * Helper to check if error is due to expired session
   */
  const isSessionExpiredError = (error: any): boolean => {
    if (!error) return false
    const message = error?.message?.toLowerCase() || ""
    return (
      message.includes("invalid jwt") ||
      message.includes("expired") ||
      message.includes("unauthorized") ||
      error?.status === 401
    )
  }

  /**
   * Refresh user permissions on demand
   * Useful when permissions are added/modified after user login
   */
  const refreshPermissions = async (): Promise<void> => {
    if (!session?.user?.id) {
      console.warn("Cannot refresh permissions: no active session")
      return
    }
    try {
      await Promise.all([
        loadPermissions(session.user.id),
        loadRoles(session.user.id),
      ])
    } catch (err) {
      console.error("Error refreshing permissions/roles:", err)
      if (isSessionExpiredError(err)) {
        // Session expired, force logout
        try {
          await supabase.auth.signOut()
        } catch {
          // ignore
        }
        setSession(null)
        setUser(null)
        setPermissions([])
        setRoles([])
      }
    }
  }

  /**
   * Load user permissions from v_user_permissions view
   * This view returns normalized permissions: user_id, module_code, permission_code
   * Includes timeout to prevent indefinite hanging
   */
  const loadPermissions = async (userId: string): Promise<void> => {
    try {
      // Set a timeout for the query (5s)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Permission query timeout")),
          5000
        )
      )

      const queryPromise = supabase
        .from("v_user_permissions")
        .select("user_id, module_code, permission_code")
        .eq("user_id", userId)

      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]) as any

      if (error) {
        console.error("Failed to load permissions:", error)
        if (isSessionExpiredError(error)) {
          throw error
        }
        setPermissions([])
        return
      }

      setPermissions((data as UserPermission[]) || [])
    } catch (err) {
      console.error("Error loading permissions:", err)
      if (isSessionExpiredError(err)) {
        throw err
      }
      setPermissions([])
    }
  }

  const loadRoles = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("roles(code)")
        .eq("user_id", userId)

      if (error) {
        console.error("Failed to load roles:", error)
        setRoles([])
        return
      }

      const roleCodes = (data || []).map((r: any) => r.roles?.code).filter(Boolean)
      setRoles(roleCodes)
    } catch (err) {
      console.error("Error loading roles:", err)
      setRoles([])
    }
  }

  /**
   * Load user data from auth and business tables
   */
  const loadUser = async (userId: string): Promise<void> => {
    try {
      // Set a timeout for getting user (3s)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("User query timeout")),
          3000
        )
      )

      const getUserPromise = supabase.auth.getUser()

      const { data: authData, error: authError } = await Promise.race([
        getUserPromise,
        timeoutPromise,
      ]) as any

      if (authError) {
        console.error("Failed to get auth user:", authError)
        if (isSessionExpiredError(authError)) {
          throw authError
        }
        setUser(null)
        return
      }

      if (authData?.user) {
        const userData: User = {
          id: authData.user.id,
          email: authData.user.email || "",
          full_name: authData.user.user_metadata?.full_name,
          avatar_url: authData.user.user_metadata?.avatar_url,
        }

        setUser(userData)
      }
    } catch (err) {
      console.error("Error loading user:", err)
      if (isSessionExpiredError(err)) {
        throw err
      }
      setUser(null)
    }
  }

  /**
   * Initialize auth state on component mount
   */
  useEffect(() => {
    // auto-refresh timer to keep session alive
    let refreshInterval: NodeJS.Timeout | null = null
    if (session) {
      // check every minute
      refreshInterval = setInterval(async () => {
        try {
          const { default: AuthService, authService } = await import("@/core/services/AuthService")
          if (authService.isSessionExpiringsoon(session)) {
            const refreshed = await authService.refreshSession()
            if (refreshed?.session) {
              setSession(refreshed.session)
            }
          }
        } catch (err) {
          console.warn("Auto-refresh error", err)
        }
      }, 60 * 1000)
    }

    const initializeAuth = async (): Promise<void> => {
      try {
        // Set timeout for session retrieval (10s)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Auth initialization timeout")),
            10000
          )
        )

        const sessionPromise = supabase.auth.getSession()

        const { data, error } = await Promise.race([
          sessionPromise,
          timeoutPromise,
        ]) as any

        if (error) {
          console.error("Session error:", error)
          if (isSessionExpiredError(error)) {
            // Session expired, clear and redirect will happen in router
            setSession(null)
            setUser(null)
            setPermissions([])
          }
          setLoading(false)
          return
        }

        const currentSession = data?.session

        setSession(currentSession)

        if (currentSession?.user) {
          try {
            await Promise.all([
              loadUser(currentSession.user.id),
              loadPermissions(currentSession.user.id),
              loadRoles(currentSession.user.id),
            ])
          } catch (loadErr) {
            console.error("Error loading user/permissions/roles:", loadErr)
            if (isSessionExpiredError(loadErr)) {
              // Session expired during load
              setSession(null)
              setUser(null)
              setPermissions([])
              setRoles([])
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err)
        setSession(null)
        setUser(null)
        setPermissions([])
      } finally {
        // CRITICAL: Always set loading to false, even on error
        setLoading(false)
      }
    }

    initializeAuth()

    /**
     * Listen for auth state changes
     * Handles logout, expiry, and token refresh
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)

      if (newSession?.user) {
        try {
          await Promise.all([
            loadUser(newSession.user.id),
            loadPermissions(newSession.user.id),
            loadRoles(newSession.user.id),
          ])
        } catch (err) {
          console.error("Error on auth state change:", err)
          if (isSessionExpiredError(err)) {
            setSession(null)
            setUser(null)
            setPermissions([])
          }
        }
      } else {
        setUser(null)
        setPermissions([])
      }
    })

    /**
     * Attempt logout when browser closes
     * Uses timeout to prevent hanging
     */
    const handleBeforeUnload = async () => {
      try {
        // Wrap in Promise.race with timeout
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 2000)
        )

        const signOutPromise = supabase.auth.signOut()

        await Promise.race([signOutPromise, timeoutPromise])
      } catch (err) {
        // Failure on unload is expected if session expired
        console.warn("Signout on unload:", err instanceof Error ? err.message : "unknown error")
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      if (refreshInterval) clearInterval(refreshInterval)
      subscription.unsubscribe()
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const value: AuthContextType = {
    session,
    user,
    roles,
    permissions,
    loading,
    isAuthenticated: !!user,
    refreshPermissions,
    hasPermission: (moduleCode, permissionCode) =>
      permissions.some(
        (p) =>
          p.module_code.toLowerCase() === moduleCode.toLowerCase() &&
          p.permission_code.toLowerCase() === permissionCode.toLowerCase()
      ),
    hasRole: (roleCode: string) =>
      roles.map((r) => r.toLowerCase()).includes(roleCode.toLowerCase()),
    logout: async () => {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.error("Logout failed:", err)
      }
      setSession(null)
      setUser(null)
      setPermissions([])
      setRoles([])
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use Auth context
 * @returns AuthContextType with session, user, permissions, and loading state
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}