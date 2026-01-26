import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'
type Font = 'inter' | 'manrope' | 'roboto' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  font: Font
  setFont: (font: Font) => void
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  font: 'system',
  setTheme: () => null,
  setFont: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [font, setFontState] = useState<Font>('system')

  // Load from localStorage on mount
  useEffect(() => {
    const storedTheme =
      (localStorage.getItem(storageKey) as Theme) || defaultTheme
    const storedFont =
      (localStorage.getItem('vite-ui-font') as Font) || 'system'

    setThemeState(storedTheme)
    setFontState(storedFont)
  }, [defaultTheme, storageKey])

  // Apply font class to root
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove(
      'font-manrope',
      'font-inter',
      'font-system',
      'font-roboto'
    )
    root.classList.add(`font-${font}`)
  }, [font])

  // Apply theme class to root
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    const resolvedTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme

    root.classList.add(resolvedTheme)

    const themeColor = resolvedTheme === 'dark' ? '#020817' : '#ffffff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor)
    }
  }, [theme])

  // Setters that sync with localStorage
  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setThemeState(newTheme)
  }

  const handleSetFont = (newFont: Font) => {
    localStorage.setItem('vite-ui-font', newFont)
    setFontState(newFont)
  }

  const value: ThemeProviderState = {
    theme,
    setTheme: handleSetTheme,
    font,
    setFont: handleSetFont,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
