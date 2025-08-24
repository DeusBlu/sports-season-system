import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import type { Season, HockeyGame } from '../services/dataService'

// Custom render function that includes Router wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockSeason = (overrides: Partial<Season> = {}): Season => ({
  id: 'season-1',
  name: 'Test Season',
  game: 'NHL 25',
  sportsType: 'Hockey',
  numberOfPlayers: 4,
  numberOfGames: 10,
  canReschedule: true,
  daySpanPerGame: 3,
  createdAt: '2025-08-01T00:00:00.000Z',
  ownerId: 'user-1',
  status: 'active',
  ...overrides
})

export const createMockGame = (overrides: Partial<HockeyGame> = {}): HockeyGame => ({
  id: 'game-1',
  seasonId: 'season-1',
  title: 'vs Lightning',
  start: new Date('2025-08-25T19:00:00'),
  end: new Date('2025-08-25T21:00:00'),
  isMyGame: true,
  opponent: 'Lightning',
  gameType: 'scheduled',
  isHome: true,
  playerId: 'user-1',
  ...overrides
})

// Mock data sets
export const mockSeasons: Season[] = [
  createMockSeason({
    id: 'season-1',
    name: 'Summer League',
    game: 'NHL 25',
    numberOfGames: 20
  }),
  createMockSeason({
    id: 'season-2',
    name: 'Winter Tournament',
    game: 'Wayne Gretzky Hockey',
    numberOfGames: 8,
    status: 'completed'
  })
]

export const mockGames: HockeyGame[] = [
  createMockGame({
    id: 'game-1',
    title: 'vs Lightning',
    isHome: true,
    isMyGame: true
  }),
  createMockGame({
    id: 'game-2',
    title: '@ Rangers',
    start: new Date('2025-08-27T20:00:00'),
    end: new Date('2025-08-29T22:00:00'),
    isHome: false,
    isMyGame: true,
    opponent: 'Rangers'
  }),
  createMockGame({
    id: 'game-3',
    title: 'Bruins @ Capitals',
    start: new Date('2025-08-28T18:00:00'),
    end: new Date('2025-08-28T20:00:00'),
    isMyGame: false,
    opponent: 'Capitals',
    isHome: false
  })
]

// Test helpers
export const setupLocalStorage = (data: Record<string, unknown>) => {
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
}

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))
