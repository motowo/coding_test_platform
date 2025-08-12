import { render, screen } from '@testing-library/react'
import Home from './index'

describe('Home Page', () => {
  it('Should render the home page with welcome message', () => {
    // Given: Home page is rendered
    render(<Home />)
    
    // When: Page is loaded
    // Then: Should display welcome message
    expect(screen.getByText('コーディングテストプラットフォーム')).toBeInTheDocument()
    expect(screen.getByText('環境セットアップが完了しました')).toBeInTheDocument()
  })

  it('Should have proper meta title for SEO', () => {
    // Given: Home page is rendered
    render(<Home />)
    
    // Then: Should have proper document title
    expect(document.title).toBe('Coding Test Platform')
  })
})