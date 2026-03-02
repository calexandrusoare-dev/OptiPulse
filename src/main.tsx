import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// initialize i18n configuration (loads translations)
import "./lib/i18n"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)