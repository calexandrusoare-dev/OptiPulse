import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// Use sessionStorage instead of localStorage so that auth data is cleared
// when the browser (or tab) is closed. This prevents the user from remaining
// "authenticated" after a full browser shutdown and then hitting errors when
// the stored token has expired.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})