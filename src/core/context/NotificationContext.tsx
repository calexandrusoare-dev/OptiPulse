import React, { createContext, useContext, useState, ReactNode, useCallback } from "react"

export type NotificationType = "success" | "error" | "info" | "warning"

export interface Notification {
  id: string
  type: NotificationType
  message: string
}

interface NotificationContextType {
  addNotification: (message: string, type?: NotificationType) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export const useNotification = (): NotificationContextType => {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error("useNotification must be used within NotificationProvider")
  }
  return ctx
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (message: string, type: NotificationType = "info") => {
      const id = Date.now().toString()
      setNotifications((prev) => [...prev, { id, message, type }])
      // auto dismiss after 4s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, 4000)
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      {/* toasts container */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`max-w-xs w-full px-4 py-2 rounded shadow-lg text-white flex justify-between items-center 
              ${{
                success: "bg-green-500",
                error: "bg-red-500",
                info: "bg-blue-500",
                warning: "bg-yellow-500 text-black",
              }[n.type]}`}
          >
            <span>{n.message}</span>
            <button
              className="ml-2 font-bold"
              onClick={() => removeNotification(n.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
