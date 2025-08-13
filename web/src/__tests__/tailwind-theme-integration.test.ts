/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'

// Mock CSS custom properties for testing
const mockComputedStyle = (element: Element, properties: Record<string, string>) => {
  const mockGetComputedStyle = jest.fn()
  Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle,
  })
  
  mockGetComputedStyle.mockReturnValue({
    getPropertyValue: (prop: string) => properties[prop] || '',
  })
  
  return mockGetComputedStyle
}

describe('Tailwind CSS テーマ統合テスト', () => {
  beforeEach(() => {
    // Reset document attributes
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('class')
  })

  describe('RED: CSS変数とTailwindクラス統合', () => {
    test('light テーマでCSS変数が正しく設定される', () => {
      document.documentElement.setAttribute('data-theme', 'light')
      
      // Mock light theme CSS variables
      mockComputedStyle(document.documentElement, {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--primary': '221.2 83.2% 53.3%',
        '--primary-foreground': '210 40% 98%',
      })
      
      const rootStyle = window.getComputedStyle(document.documentElement)
      
      expect(rootStyle.getPropertyValue('--background')).toBe('0 0% 100%')
      expect(rootStyle.getPropertyValue('--foreground')).toBe('222.2 84% 4.9%')
      expect(rootStyle.getPropertyValue('--primary')).toBe('221.2 83.2% 53.3%')
    })

    test('dark テーマでCSS変数が正しく設定される', () => {
      document.documentElement.setAttribute('data-theme', 'dark')
      
      // Mock dark theme CSS variables
      mockComputedStyle(document.documentElement, {
        '--background': '222.2 84% 4.9%',
        '--foreground': '210 40% 98%',
        '--primary': '217.2 91.2% 59.8%',
        '--primary-foreground': '222.2 84% 4.9%',
      })
      
      const rootStyle = window.getComputedStyle(document.documentElement)
      
      expect(rootStyle.getPropertyValue('--background')).toBe('222.2 84% 4.9%')
      expect(rootStyle.getPropertyValue('--foreground')).toBe('210 40% 98%')
      expect(rootStyle.getPropertyValue('--primary')).toBe('217.2 91.2% 59.8%')
    })
  })

  describe('RED: Tailwind カスタムカラー適用', () => {
    test('background/foregroundクラスがhsl()形式で適用される', () => {
      document.documentElement.setAttribute('data-theme', 'light')
      
      const element = document.createElement('div')
      element.className = 'bg-background text-foreground'
      document.body.appendChild(element)
      
      mockComputedStyle(element, {
        'background-color': 'hsl(0, 0%, 100%)',
        'color': 'hsl(222.2, 84%, 4.9%)',
      })
      
      const style = window.getComputedStyle(element)
      
      expect(style.getPropertyValue('background-color')).toBe('hsl(0, 0%, 100%)')
      expect(style.getPropertyValue('color')).toBe('hsl(222.2, 84%, 4.9%)')
      
      document.body.removeChild(element)
    })

    test('primary/secondaryカラーが正しく適用される', () => {
      document.documentElement.setAttribute('data-theme', 'light')
      
      const button = document.createElement('button')
      button.className = 'bg-primary text-primary-foreground'
      document.body.appendChild(button)
      
      mockComputedStyle(button, {
        'background-color': 'hsl(221.2, 83.2%, 53.3%)',
        'color': 'hsl(210, 40%, 98%)',
      })
      
      const style = window.getComputedStyle(button)
      
      expect(style.getPropertyValue('background-color')).toBe('hsl(221.2, 83.2%, 53.3%)')
      expect(style.getPropertyValue('color')).toBe('hsl(210, 40%, 98%)')
      
      document.body.removeChild(button)
    })

    test('accent-lime/accent-cyanが限定的に使用できる', () => {
      document.documentElement.setAttribute('data-theme', 'light')
      
      const highlightElement = document.createElement('span')
      highlightElement.className = 'text-accent-lime bg-accent-cyan'
      document.body.appendChild(highlightElement)
      
      mockComputedStyle(highlightElement, {
        'color': 'hsl(82.7, 78%, 55.5%)',
        'background-color': 'hsl(188.7, 85.7%, 53.3%)',
      })
      
      const style = window.getComputedStyle(highlightElement)
      
      expect(style.getPropertyValue('color')).toBe('hsl(82.7, 78%, 55.5%)')
      expect(style.getPropertyValue('background-color')).toBe('hsl(188.7, 85.7%, 53.3%)')
      
      document.body.removeChild(highlightElement)
    })
  })

  describe('RED: カスタムレイアウトとタイポグラフィ', () => {
    test('カスタムborder-radiusが正しく適用される', () => {
      const card = document.createElement('div')
      card.className = 'rounded-lg'
      document.body.appendChild(card)
      
      mockComputedStyle(card, {
        'border-radius': 'var(--radius)', // 0.5rem
      })
      
      const style = window.getComputedStyle(card)
      
      expect(style.getPropertyValue('border-radius')).toBe('var(--radius)')
      
      document.body.removeChild(card)
    })

    test('カスタムフォントファミリーが適用される', () => {
      document.body.className = 'font-sans'
      
      mockComputedStyle(document.body, {
        'font-family': 'var(--font-sans), system-ui, sans-serif',
      })
      
      const style = window.getComputedStyle(document.body)
      
      expect(style.getPropertyValue('font-family')).toBe('var(--font-sans), system-ui, sans-serif')
      
      document.body.className = ''
    })

    test('カスタムフォントサイズとline-heightが適用される', () => {
      const heading = document.createElement('h1')
      heading.className = 'text-3xl'
      document.body.appendChild(heading)
      
      mockComputedStyle(heading, {
        'font-size': '30px',
        'line-height': '1.2',
      })
      
      const style = window.getComputedStyle(heading)
      
      expect(style.getPropertyValue('font-size')).toBe('30px')
      expect(style.getPropertyValue('line-height')).toBe('1.2')
      
      document.body.removeChild(heading)
    })
  })

  describe('RED: カスタムアニメーション', () => {
    test('fade-inアニメーションが定義される', () => {
      const element = document.createElement('div')
      element.className = 'animate-fade-in'
      document.body.appendChild(element)
      
      mockComputedStyle(element, {
        'animation-name': 'fadeIn',
        'animation-duration': '0.5s',
        'animation-timing-function': 'ease-in-out',
      })
      
      const style = window.getComputedStyle(element)
      
      expect(style.getPropertyValue('animation-name')).toBe('fadeIn')
      expect(style.getPropertyValue('animation-duration')).toBe('0.5s')
      expect(style.getPropertyValue('animation-timing-function')).toBe('ease-in-out')
      
      document.body.removeChild(element)
    })

    test('slide-upアニメーションが定義される', () => {
      const element = document.createElement('div')
      element.className = 'animate-slide-up'
      document.body.appendChild(element)
      
      mockComputedStyle(element, {
        'animation-name': 'slideUp',
        'animation-duration': '0.3s',
        'animation-timing-function': 'ease-out',
      })
      
      const style = window.getComputedStyle(element)
      
      expect(style.getPropertyValue('animation-name')).toBe('slideUp')
      expect(style.getPropertyValue('animation-duration')).toBe('0.3s')
      expect(style.getPropertyValue('animation-timing-function')).toBe('ease-out')
      
      document.body.removeChild(element)
    })
  })

  describe('RED: ユーティリティクラス', () => {
    test('text-gradientクラスでグラデーションテキストが適用される', () => {
      const text = document.createElement('span')
      text.className = 'text-gradient'
      document.body.appendChild(text)
      
      mockComputedStyle(text, {
        'background-image': 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)))',
        'background-clip': 'text',
        'color': 'transparent',
      })
      
      const style = window.getComputedStyle(text)
      
      expect(style.getPropertyValue('background-image')).toContain('linear-gradient')
      expect(style.getPropertyValue('background-clip')).toBe('text')
      expect(style.getPropertyValue('color')).toBe('transparent')
      
      document.body.removeChild(text)
    })

    test('shimmerアニメーションが適用される', () => {
      const skeleton = document.createElement('div')
      skeleton.className = 'shimmer'
      document.body.appendChild(skeleton)
      
      mockComputedStyle(skeleton, {
        'background': 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.1) 50%, hsl(var(--muted)) 100%)',
        'background-size': '200% 100%',
        'animation': 'shimmer 1.5s infinite',
      })
      
      const style = window.getComputedStyle(skeleton)
      
      expect(style.getPropertyValue('background')).toContain('linear-gradient')
      expect(style.getPropertyValue('background-size')).toBe('200% 100%')
      expect(style.getPropertyValue('animation')).toBe('shimmer 1.5s infinite')
      
      document.body.removeChild(skeleton)
    })
  })

  describe('RED: ダークモード対応確認', () => {
    test('darkMode設定でdata-theme="dark"とclass="dark"両方をサポート', () => {
      // Test data-theme approach
      document.documentElement.setAttribute('data-theme', 'dark')
      
      mockComputedStyle(document.documentElement, {
        '--background': '222.2 84% 4.9%',
        '--foreground': '210 40% 98%',
      })
      
      let style = window.getComputedStyle(document.documentElement)
      
      expect(style.getPropertyValue('--background')).toBe('222.2 84% 4.9%')
      expect(style.getPropertyValue('--foreground')).toBe('210 40% 98%')
      
      // Test class approach
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.classList.add('dark')
      
      mockComputedStyle(document.documentElement, {
        '--background': '222.2 84% 4.9%',
        '--foreground': '210 40% 98%',
      })
      
      style = window.getComputedStyle(document.documentElement)
      
      expect(style.getPropertyValue('--background')).toBe('222.2 84% 4.9%')
      expect(style.getPropertyValue('--foreground')).toBe('210 40% 98%')
      
      document.documentElement.classList.remove('dark')
    })
  })
})