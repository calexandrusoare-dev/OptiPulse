import { useState } from "react"
import { supabase } from "../../api/supabaseClient"

export default function LeavePlanning() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [year, setYear] = useState(new Date().getFullYear())

  async function savePlanning() {
    const { data: userData } = await supabase.auth.getUser()

    const { data: workingDays } = await supabase.rpc(
      "calculate_working_days",
      {
        p_location_id: null,
        p_start_date: startDate,
        p_end_date: endDate
      }
    )

    await supabase.from("leave_planning").insert({
      employee_id: userData.user?.id,
      location_id: null,
      year,
      start_date: startDate,
      end_date: endDate,
      days: workingDays,
      status: "draft"
    })

    alert("Planning saved")
  }

  return (
    <div>
      <h2>Leave Planning</h2>

      <input type="number"
             value={year}
             onChange={e => setYear(Number(e.target.value))} />

      <input type="date"
             onChange={e => setStartDate(e.target.value)} />

      <input type="date"
             onChange={e => setEndDate(e.target.value)} />

      <button onClick={savePlanning}>Save Planning</button>
    </div>
  )
}