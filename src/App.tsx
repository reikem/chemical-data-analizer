
import "./index.css"

/* ── Providers propios ───────────────────────────────────────────────────── */
import { TanStackProvider }   from "./providers/tanstack-provider"
import { CustomTourGuide }    from "./components/custom-tour-guide"
import ThemeProvider          from "./components/theme-provider"

/* ── Fuente Inter (opcional con @fontsource) ─────────────────────────────── */
/* yarn add @fontsource/inter  ó  npm i @fontsource/inter                    */
import "@fontsource/inter/latin.css"
import type { ReactNode } from "react"

/* -------------------------------------------------------------------------- */

type AppProps = { children?: ReactNode }

export default function App({ children }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TanStackProvider>
        {children}
        <CustomTourGuide />
      </TanStackProvider>
    </ThemeProvider>
  )
}