import { useState } from "react"
import { supabase } from "../api/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      import { useNavigate } from "react-router-dom"

const navigate = useNavigate()

// după login reușit:
navigate("/hr/leave-requests")
    }
  }

  return (
    <div className="login-container">
      <div className="login-title">OptiPulse Login</div>

      <input
        className="login-input"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="login-input"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
    </div>
  )
}