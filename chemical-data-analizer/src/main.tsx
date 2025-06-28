import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TanStackProvider } from "./providers/tanstack-provider";
import "./index.css"; // Asegúrate de que este archivo exista y tenga estilos globales
import ThemeProvider from "./components/theme-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
  
    <ThemeProvider>
      <TanStackProvider>
        <App />
      </TanStackProvider>
    </ThemeProvider>
  </React.StrictMode>
);