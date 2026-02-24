import { useState } from "react"
import { supabase } from "../../api/supabaseClient"

export default function Users() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [roleId, setRoleId] = useState("")
  const [locationId, setLocationId] = useState("")

  async function createUser() {
    await supabase.functions.invoke("create-user", {
      body: {
        email,
        password,
        full_name: fullName,
        role_id: roleId,
        location_id: locationId
      }
    })

    alert("User created")
  }

  return (
    <div>
      <h2>User Management</h2>

      <input placeholder="Email"
             onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password"
             type="password"
             onChange={e => setPassword(e.target.value)} />
      <input placeholder="Full Name"
             onChange={e => setFullName(e.target.value)} />
      <input placeholder="Role ID"
             onChange={e => setRoleId(e.target.value)} />
      <input placeholder="Location ID"
             onChange={e => setLocationId(e.target.value)} />

      <button onClick={createUser}>Create User</button>
    </div>
  )
}