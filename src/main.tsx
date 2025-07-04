import React    from "react"
import ReactDOM from "react-dom/client"
import App      from "./App"

/* Si usas React-Router lo montarías aquí */
import { Home } from "./pages/Home"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App>
      <Home />
    </App>
  </React.StrictMode>,
)