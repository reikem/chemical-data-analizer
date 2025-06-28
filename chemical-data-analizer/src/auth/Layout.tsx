import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"


import { TanStackProvider } from "../providers/tanstack-provider"
import { CustomTourGuide } from "../components/custom-tour-guide"
import ThemeProvider from "../components/theme-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Analizador de Datos Químicos",
  description: "Aplicación para analizar y visualizar datos de elementos químicos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
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
