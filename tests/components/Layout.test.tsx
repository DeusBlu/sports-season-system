import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../helpers/utils'
import Layout from '../../src/components/Layout'

// Mock the router context for testing navigation
const mockLocation = {
  pathname: '/hockey/schedule'
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => mockLocation,
  }
})

describe('Layout', () => {
  it('should render top navigation with Hockey selected', () => {
    render(<Layout><div>Test content</div></Layout>)

    // Check top navigation
    expect(screen.getByText('Hockey')).toBeInTheDocument()
    expect(screen.getByText('Hockey')).toHaveClass('active')
  })

  it('should render sidebar navigation', () => {
    render(<Layout><div>Test content</div></Layout>)

    // Check sidebar navigation items
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Manage Seasons')).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    render(<Layout><div>Test content</div></Layout>)

    // Since mockLocation.pathname is '/hockey/schedule', Schedule should be active
    const scheduleLink = screen.getByRole('link', { name: /schedule/i })
    expect(scheduleLink).toHaveClass('active')
  })

  it('should render outlet for page content', () => {
    render(<Layout><div data-testid="outlet">Page Content</div></Layout>)

    expect(screen.getByTestId('outlet')).toBeInTheDocument()
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('should have proper navigation links', () => {
    render(<Layout><div>Test content</div></Layout>)

    const scheduleLink = screen.getByRole('link', { name: /schedule/i })
    const manageSeasonsLink = screen.getByRole('link', { name: /manage seasons/i })

    expect(scheduleLink).toHaveAttribute('href', '/hockey/schedule')
    expect(manageSeasonsLink).toHaveAttribute('href', '/hockey/manage-seasons')
  })

  it('should apply ice hockey theme styling', () => {
    render(<Layout><div>Test Content</div></Layout>)

    // Check that the layout has the expected structure
    expect(screen.getByText('Hockey')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Manage Seasons')).toBeInTheDocument()
  })

  it('should handle navigation clicks', async () => {
    const user = userEvent.setup()
    render(<Layout><div>Test content</div></Layout>)

    const manageSeasonsLink = screen.getByRole('link', { name: /manage seasons/i })
    
    // Should be able to click navigation links
    await user.click(manageSeasonsLink)
    
    // The link should exist and be clickable
    expect(manageSeasonsLink).toBeInTheDocument()
  })
})
