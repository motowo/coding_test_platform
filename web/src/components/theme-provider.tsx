"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "skillgaug-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setInternalTheme] = React.useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      return storedTheme || defaultTheme
    }
    return defaultTheme
  })
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement

    root.removeAttribute("data-theme")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"

      root.setAttribute("data-theme", systemTheme)
      return
    }

    root.setAttribute("data-theme", theme)
  }, [theme, mounted])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setInternalTheme(newTheme)
    },
    [storageKey]
  )

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {mounted ? children : <div suppressHydrationWarning>{children}</div>}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    // During SSR/SSG, return default values instead of throwing
    if (typeof window === "undefined") {
      return {
        theme: "system" as Theme,
        setTheme: () => {},
      }
    }
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}