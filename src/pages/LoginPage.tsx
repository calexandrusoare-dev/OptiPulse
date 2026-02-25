import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../api/supabaseClient"

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    navigate("/hr/leave-requests")
  }

  return (
    <div className="login-container">
      <div className="login-title">OptiPulse Login</div>

      <form onSubmit={handleLogin}>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {errorMessage && (
          <div style={{ color: "red", marginBottom: "10px", fontSize: "14px" }}>
            {errorMessage}
          </div>
        )}

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Se autentifică..." : "Login"}
        </button>
      </form>
    </div>
  )
}