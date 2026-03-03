import AppRouter from "./router/AppRouter"
import { AuthProvider } from "./auth/AuthProvider"
import { NotificationProvider } from "./core/context/NotificationContext"

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </AuthProvider>
  )
}