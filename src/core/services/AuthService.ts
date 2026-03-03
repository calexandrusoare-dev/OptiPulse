/**
 * AuthService
 * Handles authentication, session management, and token refresh
 */

import { supabase } from "@/api/supabaseClient"
import { User, AuthSession } from "@/core/types"
import { SESSION_CONFIG } from "@/core/constants"

class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      const user = this.mapAuthUserToBusinessUser(data.user)
      return {
        user,
        session: data.session,
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
      // Also notify backend about logout
      await this.notifyLogout()
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        return null
      }

      const user = await this.getUserProfile(session.user.id)
      return {
        user,
        session,
      }
    } catch (error) {
      console.error("Get session error:", error)
      return null
    }
  }

  /**
   * Refresh access token
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()

      if (error || !session) {
        return null
      }

      const user = await this.getUserProfile(session.user.id)
      return {
        user,
        session,
      }
    } catch (error) {
      console.error("Refresh session error:", error)
      return null
    }
  }

  /**
   * Get user profile from core.users table
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.warn("Could not fetch user profile, using auth user data")
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        return this.mapAuthUserToBusinessUser(authUser)
      }

      return data
    } catch (error) {
      console.error("Get user profile error:", error)
      throw error
    }
  }

  /**
   * Reset password request
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Password reset request error:", error)
      throw error
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Email verification error:", error)
      throw error
    }
  }

  /**
   * Map Supabase auth user to business user model
   */
  private mapAuthUserToBusinessUser(authUser: any): User {
    return {
      id: authUser?.id || "",
      email: authUser?.email || "",
      full_name: authUser?.user_metadata?.full_name || "",
      avatar_url: authUser?.user_metadata?.avatar_url || "",
      is_active: true,
      created_at: authUser?.created_at,
      updated_at: authUser?.updated_at,
    }
  }

  /**
   * Notify backend about logout (for audit logging)
   */
  private async notifyLogout(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Could implement audit logging here
      }
    } catch {
      // Ignore errors during logout notification
    }
  }

  /**
   * Get session expiry time
   */
  getSessionExpiryTime(session: any): Date | null {
    if (!session?.expires_at) return null
    return new Date(session.expires_at * 1000)
  }

  /**
   * Check if session is expiring soon
   */
  isSessionExpiringsoon(session: any, thresholdMs: number = SESSION_CONFIG.REFRESH_TOKEN_BEFORE_EXPIRY_MS): boolean {
    const expiryTime = this.getSessionExpiryTime(session)
    if (!expiryTime) return false

    const now = new Date()
    const timeUntilExpiry = expiryTime.getTime() - now.getTime()

    return timeUntilExpiry < thresholdMs
  }
}

export const authService = new AuthService()
export default AuthService
