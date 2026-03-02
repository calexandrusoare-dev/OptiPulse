/**
 * OptiPulse - Login Page
 * Enterprise authentication interface
 */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../api/supabaseClient"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      // After successful login, send user to dashboard (root).
      // Previously we hardcoded an HR route which caused access-denied
      // if the user didn't have HR permissions.
      navigate("/")
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">OptiPulse</h1>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {errorMessage && (
            <div className="login-error">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading || !email.trim() || !password}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "12px",
            color: "var(--gray-500)",
          }}
        >
          Enterprise Management System
        </p>
      </div>
    </div>
  )
}