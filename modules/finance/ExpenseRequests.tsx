import { useEffect, useState } from "react"
import { supabase } from "../../api/supabaseClient"

export default function ExpenseRequests() {
  const [expenses, setExpenses] = useState<any[]>([])

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    const { data } = await supabase
      .from("expense_requests")
      .select("*")
      .order("created_at", { ascending: false })

    setExpenses(data || [])
  }

  async function createExpense() {
    const { data: userData } = await supabase.auth.getUser()

    await supabase.from("expense_requests").insert({
      employee_id: userData.user?.id,
      total_amount: 100,
      status: "draft"
    })

    loadExpenses()
  }

  return (
    <div>
      <h2>Expense Requests</h2>
      <button onClick={createExpense}>New Expense</button>

      <ul>
        {expenses.map(e => (
          <li key={e.id}>
            {e.request_date} | {e.total_amount} | {e.status}
          </li>
        ))}
      </ul>
    </div>
  )
}