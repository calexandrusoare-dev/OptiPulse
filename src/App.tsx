import LeaveRequests from "./modules/hr/LeaveRequests"
import LeavePlanning from "./modules/hr/LeavePlanning"
import ExpenseRequests from "./modules/finance/ExpenseRequests"
import Users from "./modules/admin/Users"

function App() {
  return (
    <div>
      <h1>HR & Finance App</h1>

      <LeaveRequests />
      <LeavePlanning />
      <ExpenseRequests />
      <Users />
    </div>
  )
}

export default App