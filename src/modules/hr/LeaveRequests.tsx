import { useEffect, useState } from "react"
import { supabase } from "../../api/supabaseClient"

export default function LeaveRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [leaveType, setLeaveType] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
    loadRequests()
  }, [])

  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  async function loadRequests() {
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false })

    setRequests(data || [])
  }

  async function createRequest() {
    if (!user) return

    const { data: workingDays } = await supabase.rpc(
      "calculate_working_days",
      {
        p_location_id: null,
        p_start_date: startDate,
        p_end_date: endDate
      }
    )

    await supabase.from("leave_requests").insert({
      employee_id: user.id,
      location_id: null,
      leave_type_id: leaveType,
      start_date: startDate,
      end_date: endDate,
      days: workingDays,
      status: "pending_manager"
    })

    loadRequests()
  }

  return (
    <div>
      <h2>Leave Requests</h2>

      <input type="date" onChange={e => setStartDate(e.target.value)} />
      <input type="date" onChange={e => setEndDate(e.target.value)} />
      <input placeholder="Leave Type ID"
             onChange={e => setLeaveType(e.target.value)} />

      <button onClick={createRequest}>Submit</button>

      <ul>
        {requests.map(r => (
          <li key={r.id}>
            {r.start_date} - {r.end_date} | {r.status}
          </li>
        ))}
      </ul>
    </div>
  )
}