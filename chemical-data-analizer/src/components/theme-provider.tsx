import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Wrapper para el ThemeProvider de `next-themes`
 * Funciona igual en Vite, CRA o cualquier app React.
 */
export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  /* 
   * props típicos:
   *  defaultTheme="system"
   *  attribute="class" | "data-theme"
   */
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
export default ThemeProvider;