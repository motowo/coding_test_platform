/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider, useTheme } from '../theme-provider'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Test component that uses useTheme hook
const TestComponent = () => {
  const { theme, setTheme } = useTheme()
  
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button 
        data-testid="set-light"
        onClick={() => setTheme('light')}
      >
        Light
      </button>
      <button 
        data-testid="set-dark" 
        onClick={() => setTheme('dark')}
      >
        Dark
      </button>
      <button 
        data-testid="set-system"
        onClick={() => setTheme('system')}
      >
        System
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    document.documentElement.removeAttribute('data-theme')
  })

  describe('RED: 初期状態とデフォルトテーマ', () => {
    test('デフォルトでsystemテーマが設定される', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
    })

    test('デフォルトテーマをカスタマイズできる', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    test('localStorageから既存のテーマ設定を読み込める', async () => {
      localStorageMock.getItem.mockReturnValue('light')
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      })
    })
  })

  describe('RED: テーマ切替機能', () => {
    test('lightテーマに切り替えるとdata-theme属性が設定される', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      fireEvent.click(screen.getByTestId('set-light'))
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
      })
    })

    test('darkテーマに切り替えるとdata-theme属性が設定される', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      fireEvent.click(screen.getByTestId('set-dark'))
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
      })
    })

    test('systemテーマ設定時はシステム設定に基づいてdata-themeが決まる', async () => {
      // Mock system dark mode
      const matchMediaMock = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock,
      })
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      fireEvent.click(screen.getByTestId('set-system'))
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
      })
    })
  })

  describe('RED: localStorage連携', () => {
    test('テーマ変更時にlocalStorageに保存される', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )
      
      fireEvent.click(screen.getByTestId('set-light'))
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('skillgaug-ui-theme', 'light')
      })
    })

    test('カスタムstorageKeyが使用される', async () => {
      render(
        <ThemeProvider storageKey="custom-theme-key">
          <TestComponent />
        </ThemeProvider>
      )
      
      fireEvent.click(screen.getByTestId('set-dark'))
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('custom-theme-key', 'dark')
      })
    })
  })

  describe('RED: エラーハンドリング', () => {
    test('ThemeProviderの外でuseThemeを使用するとエラーが発生する', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useTheme must be used within a ThemeProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('RED: Hydration対応', () => {
    test('マウント前はsuppressHydrationWarningでラップされる', () => {
      const { container } = render(
        <ThemeProvider>
          <div data-testid="test-child">Test Content</div>
        </ThemeProvider>
      )
      
      // Initial render should have suppressHydrationWarning
      expect(container.firstChild).toHaveProperty('suppressHydrationWarning', true)
    })
  })
})