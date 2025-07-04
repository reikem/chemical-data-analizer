import type React from "react"
import "./globals.css"
import { TanStackProvider } from "../providers/tanstack-provider"
import { CustomTourGuide } from "../components/custom-tour-guide"
import ThemeProvider from "../components/theme-provider"






export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TanStackProvider>
            {children}
            <CustomTourGuide />
          </TanStackProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
