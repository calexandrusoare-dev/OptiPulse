import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../api/supabaseClient"
import { Session } from "@supabase/supabase-js"

type Permission = {
  module: string
  permission: string
}

type AuthContextType = {
  session: Session | null
  permissions: Permission[]
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  permissions: [],
})

export function AuthProvider({ children }: any) {
  const [session, setSession] = useState<Session | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      if (data.session) {
        await loadPermissions(data.session.user.id)
      }

      setLoading(false)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)

        if (session) {
          await loadPermissions(session.user.id)
        } else {
          setPermissions([])
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const loadPermissions = async (userId: string) => {
    const { data } = await supabase
      .from("module_permissions")
      .select("module, permission")
      .eq("user_id", userId)

    setPermissions(data || [])
  }

  return (
    <AuthContext.Provider value={{ session, permissions }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)