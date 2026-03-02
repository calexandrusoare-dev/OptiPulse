import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { supabase } from "../api/supabaseClient"
import { Session } from "@supabase/supabase-js"
import { AuthContextType, UserPermission, User } from "../types"

/**
 * AuthContext initialized with default values
 */
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  permissions: [],
  loading: true,
})

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider Component
 * Manages authentication state and user permissions
 * Fetches permissions from core.v_user_permissions view
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * Load user permissions from v_user_permissions view
   * This view returns normalized permissions: user_id, module_code, permission_code
   */
  const loadPermissions = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("v_user_permissions")
        .select("user_id, module_code, permission_code")
        .eq("user_id", userId)

      if (error) {
        console.error("Failed to load permissions:", error)
        setPermissions([])
        return
      }

      setPermissions((data as UserPermission[]) || [])
    } catch (err) {
      console.error("Error loading permissions:", err)
      setPermissions([])
    }
  }

  /**
   * Load user data from auth and business tables
   */
  const loadUser = async (userId: string): Promise<void> => {
    try {
      // Get auth user
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error("Failed to get auth user:", authError)
        setUser(null)
        return
      }

      if (authData.user) {
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
      setUser(null)
    }
  }

  /**
   * Initialize auth state on component mount
   */
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          setLoading(false)
          return
        }

        const currentSession = data.session

        setSession(currentSession)

        if (currentSession?.user) {
          await Promise.all([
            loadUser(currentSession.user.id),
            loadPermissions(currentSession.user.id),
          ])
        }
      } catch (err) {
        console.error("Auth initialization error:", err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    /**
     * Listen for auth state changes
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)

      if (newSession?.user) {
        await Promise.all([
          loadUser(newSession.user.id),
          loadPermissions(newSession.user.id),
        ])
      } else {
        setUser(null)
        setPermissions([])
      }
    })

    // when the browser (or tab) is closed) attempt to sign out so that any
    // transient state is cleaned up. This complements using sessionStorage in
    // the client setup above and also makes the logout explicit instead of
    // relying solely on storage eviction.
    const handleBeforeUnload = async () => {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        // failure isn't critical; the storage will be cleared by sessionStorage
        console.warn("Error signing out on unload:", err)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const value: AuthContextType = {
    session,
    user,
    permissions,
    loading,
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