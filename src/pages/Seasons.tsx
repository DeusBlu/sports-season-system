import { useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useLocation } from 'react-router-dom'
import { dataService } from '../services/dataService'
import type { Season } from '../services/dataService'
import { User, Crown, Users, Calendar } from 'lucide-react'
import { getSeasonStatusLabel, getSeasonStatusColor } from '../constants/seasonStatus'
import { UserPermissionsDebug } from '../components/UserPermissionsDebug'

export default function Seasons() {
  const { user, isAuthenticated } = useAuth0()
  const location = useLocation()
  const [ownedSeasons, setOwnedSeasons] = useState<Season[]>([])
  const [memberSeasons, setMemberSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine sport from URL path
  const sport = location.pathname.includes('/hockey/') ? 'Hockey' : 'Hockey' // Default to Hockey for now

  const loadUserSeasons = useCallback(async () => {
    if (!user?.sub) return

    try {
      setLoading(true)
      setError(null)
      
      const [owned, member] = await Promise.all([
        dataService.getUserOwnedSeasons(user.sub),
        dataService.getUserMemberSeasons(user.sub)
      ])
      
      // Filter seasons by sport
      const filteredOwned = owned.filter(season => 
        !season.sportsType || season.sportsType === sport || season.game?.toLowerCase().includes('hockey')
      )
      const filteredMember = member.filter(season => 
        !season.sportsType || season.sportsType === sport || season.game?.toLowerCase().includes('hockey')
      )
      
      setOwnedSeasons(filteredOwned)
      setMemberSeasons(filteredMember)
    } catch (err) {
      console.error('Failed to load user seasons:', err)
      setError('Failed to load seasons. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user?.sub, sport])

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      loadUserSeasons()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user?.sub, loadUserSeasons])

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="content-area">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600">Please login to view your seasons.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-area">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your seasons...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="content-area">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p>{error}</p>
            </div>
            <button
              onClick={loadUserSeasons}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSeasonCard = (season: Season, isOwned: boolean) => (
    <div key={season.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isOwned ? (
            <Crown className="w-5 h-5 text-yellow-500" />
          ) : (
            <Users className="w-5 h-5 text-blue-500" />
          )}
          <h3 className="font-semibold text-gray-900">{season.name}</h3>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          season.status ? getSeasonStatusColor(season.status) : 'bg-gray-100 text-gray-800'
        }`}>
          {season.status ? getSeasonStatusLabel(season.status) : 'Unknown'}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{season.game || 'Hockey'}</span>
        </div>
        <div className="flex justify-between">
          <span>{season.numberOfPlayers} players</span>
          <span>{season.numberOfGames} games</span>
        </div>
        {season.createdAt && (
          <p className="text-xs text-gray-500">
            Created {new Date(season.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
          View Schedule
        </button>
        {isOwned && (
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            Manage
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <div className="content-area">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My {sport} Seasons</h1>
          <p className="text-gray-600">
            {sport} seasons you own and participate in
          </p>
        </div>

        {/* Debug Permissions - Remove in production */}
        <div className="mb-8">
          <UserPermissionsDebug />
        </div>

        {/* Owned Seasons */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Seasons I Manage ({ownedSeasons.length})
            </h2>
          </div>
          
          {ownedSeasons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedSeasons.map(season => renderSeasonCard(season, true))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">You haven't created any seasons yet.</p>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Create Your First Season
              </button>
            </div>
          )}
        </div>

        {/* Member Seasons */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Seasons I Play In ({memberSeasons.length})
            </h2>
          </div>
          
          {memberSeasons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberSeasons.map(season => renderSeasonCard(season, false))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">You're not a member of any seasons yet.</p>
              <p className="text-sm text-gray-500 mt-1">
                Ask season managers to invite you or browse available seasons.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
