/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ThemeProvider } from '../theme-provider'
import { ThemeToggle } from '../theme-toggle'

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

const ThemeToggleWrapper = ({ defaultTheme = "system" }: { defaultTheme?: "light" | "dark" | "system" }) => (
  <ThemeProvider defaultTheme={defaultTheme}>
    <ThemeToggle />
  </ThemeProvider>
)

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    document.documentElement.removeAttribute('data-theme')
  })

  describe('RED: コンポーネント描画とアイコン表示', () => {
    test('デフォルト（system）テーマでモニターアイコンが表示される', () => {
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      expect(toggleButton).toBeInTheDocument()
      
      // System theme icon (monitor) should be displayed
      const systemIcon = toggleButton.querySelector('svg')
      expect(systemIcon).toBeInTheDocument()
      expect(systemIcon?.getAttribute('viewBox')).toBe('0 0 24 24')
    })

    test('lightテーマで太陽アイコンが表示される', () => {
      render(<ThemeToggleWrapper defaultTheme="light" />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      const sunIcon = toggleButton.querySelector('svg path[d*="M12 3v1m0 16v1"]')
      expect(sunIcon).toBeInTheDocument()
    })

    test('darkテーマで月アイコンが表示される', () => {
      render(<ThemeToggleWrapper defaultTheme="dark" />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      const moonIcon = toggleButton.querySelector('svg path[d*="M20.354 15.354A9 9"]')
      expect(moonIcon).toBeInTheDocument()
    })
  })

  describe('RED: ドロップダウンメニューの表示と操作', () => {
    test('トグルボタンクリックでドロップダウンメニューが表示される', async () => {
      const user = userEvent.setup()
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(toggleButton)
      
      expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument()
    })

    test('各メニューアイテムに適切なアイコンが表示される', async () => {
      const user = userEvent.setup()
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(toggleButton)
      
      const lightMenuItem = screen.getByRole('menuitem', { name: /light/i })
      const darkMenuItem = screen.getByRole('menuitem', { name: /dark/i })
      const systemMenuItem = screen.getByRole('menuitem', { name: /system/i })
      
      expect(lightMenuItem.querySelector('svg')).toBeInTheDocument()
      expect(darkMenuItem.querySelector('svg')).toBeInTheDocument()
      expect(systemMenuItem.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('RED: テーマ切り替え機能', () => {
    test('Lightメニューアイテムクリックでテーマが変更される', async () => {
      const user = userEvent.setup()
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(toggleButton)
      
      const lightMenuItem = screen.getByRole('menuitem', { name: /light/i })
      await user.click(lightMenuItem)
      
      // Theme should be changed and icon updated
      const updatedIcon = toggleButton.querySelector('svg path[d*="M12 3v1m0 16v1"]')
      expect(updatedIcon).toBeInTheDocument()
    })

    test('Darkメニューアイテムクリックでテーマが変更される', async () => {
      const user = userEvent.setup()
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(toggleButton)
      
      const darkMenuItem = screen.getByRole('menuitem', { name: /dark/i })
      await user.click(darkMenuItem)
      
      // Theme should be changed and icon updated
      const updatedIcon = toggleButton.querySelector('svg path[d*="M20.354 15.354A9 9"]')
      expect(updatedIcon).toBeInTheDocument()
    })

    test('Systemメニューアイテムクリックでシステムテーマが適用される', async () => {
      const user = userEvent.setup()
      render(<ThemeToggleWrapper defaultTheme="light" />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(toggleButton)
      
      const systemMenuItem = screen.getByRole('menuitem', { name: /system/i })
      await user.click(systemMenuItem)
      
      // Should show system icon (monitor)
      const systemIcon = toggleButton.querySelector('svg path[d*="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18"]')
      expect(systemIcon).toBeInTheDocument()
    })
  })

  describe('RED: アクセシビリティ', () => {
    test('トグルボタンにはscreen reader用のラベルがある', () => {
      render(<ThemeToggleWrapper />)
      
      expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument()
    })

    test('キーボードナビゲーションでメニューが操作できる', async () => {
      const user = userEvent.setup()
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      
      // Focus and activate with keyboard
      await user.tab()
      expect(toggleButton).toHaveFocus()
      
      await user.keyboard('{Enter}')
      
      // Menu should be open and focusable
      expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument()
    })
  })

  describe('RED: スタイリングとレイアウト', () => {
    test('トグルボタンには適切なvariantとsizeが適用される', () => {
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      
      // Button should have outline variant and sm size classes
      // This will fail until proper styling is implemented
      expect(toggleButton).toHaveClass('variant-outline', 'size-sm')
    })

    test('ドロップダウンメニューが適切な位置に表示される', async () => {
      const user = userEvent.setup()
      render(<ThemeToggleWrapper />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
      await user.click(toggleButton)
      
      // Menu should be aligned to the end
      const menu = screen.getByRole('menu')
      expect(menu).toHaveAttribute('data-align', 'end')
    })
  })
})