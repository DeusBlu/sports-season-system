import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './ManageSeasons.css';
import { dataService } from '../services/dataService';
import type { Season } from '../services/dataService';
import { SEASON_STATUS } from '../constants/seasonStatus';

interface SeasonSettings {
  seasonName: string;
  game: string;
  sportsType: string;
  numberOfPlayers: number;
  numberOfGames: number;
  canReschedule: boolean;
  daySpanPerGame: number;
}

const ManageSeasons: React.FC = () => {
  const { user, isAuthenticated } = useAuth0();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SeasonSettings>({
    seasonName: '',
    game: '',
    sportsType: 'Hockey',
    numberOfPlayers: 8,
    numberOfGames: 10,
    canReschedule: true,
    daySpanPerGame: 3
  });

  const loadSeasons = useCallback(async () => {
    if (!user?.sub) return;

    try {
      setLoading(true);
      const seasonData = await dataService.getUserOwnedSeasons(user.sub);
      setSeasons(seasonData);
      console.log('Loaded seasons:', seasonData);
    } catch (error) {
      console.error('Failed to load seasons:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.sub]);

  // Load user's owned seasons on component mount
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      loadSeasons();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.sub, loadSeasons]);

  // Comprehensive hockey games list - newest first
  const hockeyGames = [
    // Modern Era (2020s)
    'NHL 25',
    'NHL 24', 
    'NHL 23',
    'NHL 22',
    'NHL 21',
    'NHL 20',
    
    // 2010s Era
    'NHL 19',
    'NHL 18',
    'NHL 17',
    'NHL 16',
    'NHL 15',
    'NHL 14',
    'NHL 13',
    'NHL 12',
    'NHL 11',
    'NHL 10',
    
    // 2000s Era
    'NHL 09',
    'NHL 08',
    'NHL 07',
    'NHL 06',
    'NHL 05',
    'NHL 2004',
    'NHL 2003',
    'NHL 2002',
    'NHL 2001',
    'NHL 2000',
    
    // Classic Era (1990s)
    'NHL 99',
    'NHL 98',
    'NHL 97',
    'NHL 96',
    'NHL 95',
    'NHL 94',
    'NHL 93',
    'NHLPA Hockey 93',
    
    // Retro Era (1980s-1990s)
    'NHL Hockey (1993)',
    'Wayne Gretzky Hockey',
    'Blades of Steel',
    'Ice Hockey (NES)',
    'Hat Trick Hero',
    
    // Indie/Alternative
    'Bush Hockey League',
    'Old Time Hockey',
    'Super Blood Hockey',
    '3 on 3 NHL Arcade'
  ];

  // Game to sports type mapping - only hockey games for hockey sport
  const getAvailableGames = (sport: string) => {
    switch (sport) {
      case 'Hockey':
        return hockeyGames;
      default:
        return hockeyGames; // Default to hockey for now
    }
  };

  const calculateSeasonLength = () => {
    const { numberOfPlayers, numberOfGames, daySpanPerGame } = settings;
    
    if (numberOfPlayers % 2 !== 0) {
      return { length: 0, warning: 'Need even number of players' };
    }
    
    const gamesPerTimeWindow = numberOfPlayers / 2;
    const seasonLengthDays = numberOfGames * daySpanPerGame;
    
    return {
      length: seasonLengthDays,
      gamesPerWindow: gamesPerTimeWindow,
      totalGameSlots: numberOfGames * gamesPerTimeWindow,
      warning: null
    };
  };

  const handleGameChange = (game: string) => {
    // Since we're only doing hockey for now, sports type is always Hockey
    setSettings(prev => ({ ...prev, game, sportsType: 'Hockey' }));
  };

  const availableGames = getAvailableGames(settings.sportsType);

  const handleNumberChange = (field: keyof SeasonSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0) {
      setSettings(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleCreateSeason = async () => {
    if (!user?.sub) {
      console.error('User not authenticated');
      return;
    }

    try {
      const seasonData = {
        name: settings.seasonName,
        game: settings.game,
        sportsType: settings.sportsType,
        numberOfPlayers: settings.numberOfPlayers,
        numberOfGames: settings.numberOfGames,
        canReschedule: settings.canReschedule,
        daySpanPerGame: settings.daySpanPerGame,
        createdAt: new Date().toISOString(),
        status: SEASON_STATUS.PRESEASON
      };

      console.log('Creating season with settings:', seasonData);
      const createdSeason = await dataService.createSeasonWithOwnership(seasonData, user.sub);
      console.log('Season created:', createdSeason);
      
      // Refresh the seasons list
      loadSeasons();
      
      setShowCreateModal(false);
      // Reset form
      setSettings({
        seasonName: '',
        game: '',
        sportsType: 'Hockey',
        numberOfPlayers: 8,
        numberOfGames: 10,
        canReschedule: true,
        daySpanPerGame: 3
      });
    } catch (error) {
      console.error('Failed to create season:', error);
      // TODO: Show error message to user
    }
  };

  const isFormValid = () => {
    return settings.seasonName.trim() && 
           settings.game.trim() && 
           settings.numberOfPlayers >= 2 && 
           settings.numberOfPlayers % 2 === 0 &&
           settings.numberOfGames >= 1 &&
           settings.daySpanPerGame >= 1;
  };

  const seasonCalc = calculateSeasonLength();

  return (
    <div className="page-content">
      <h2>Manage Seasons</h2>
      <p>Create and configure sports seasons for your digital gaming leagues.</p>
      
      <div className="content-card">
        <div className="seasons-header">
          <h3>Your Seasons</h3>
          <button 
            className="create-season-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Season
          </button>
        </div>
        
        <div className="seasons-list">
          {loading ? (
            <p>Loading seasons...</p>
          ) : seasons.length === 0 ? (
            <p>No seasons created yet. Create your first season to get started!</p>
          ) : (
            <div className="seasons-grid">
              {seasons.map(season => (
                <div key={season.id} className="season-card">
                  <h4>{season.name}</h4>
                  <p><strong>Game:</strong> {season.game}</p>
                  <p><strong>Players:</strong> {season.numberOfPlayers}</p>
                  <p><strong>Games:</strong> {season.numberOfGames}</p>
                  <p><strong>Created:</strong> {season.createdAt ? new Date(season.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Season</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="season-name">Season Name *</label>
                <input
                  id="season-name"
                  type="text"
                  value={settings.seasonName}
                  onChange={(e) => setSettings(prev => ({ ...prev, seasonName: e.target.value }))}
                  placeholder="e.g., Winter Hockey League 2025"
                />
              </div>

              <div className="form-group">
                <label htmlFor="game-select">Game *</label>
                <select
                  id="game-select"
                  value={settings.game}
                  onChange={(e) => handleGameChange(e.target.value)}
                >
                  <option value="">Select a hockey game...</option>
                  {availableGames.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sports-type">Sports Type</label>
                <input
                  id="sports-type"
                  type="text"
                  value={settings.sportsType}
                  readOnly
                  className="readonly-field"
                />
                <small>Automatically set based on game selection</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="number-of-players">Number of Players *</label>
                  <input
                    id="number-of-players"
                    type="number"
                    min="2"
                    step="2"
                    value={settings.numberOfPlayers}
                    onChange={(e) => handleNumberChange('numberOfPlayers', e.target.value)}
                  />
                  <small>Must be even number</small>
                </div>

                <div className="form-group">
                  <label htmlFor="number-of-games">Number of Games *</label>
                  <input
                    id="number-of-games"
                    type="number"
                    min="1"
                    value={settings.numberOfGames}
                    onChange={(e) => handleNumberChange('numberOfGames', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="day-span">Day Span Per Game *</label>
                  <input
                    id="day-span"
                    type="number"
                    min="1"
                    max="7"
                    value={settings.daySpanPerGame}
                    onChange={(e) => handleNumberChange('daySpanPerGame', e.target.value)}
                  />
                  <small>Days available to complete each game</small>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.canReschedule}
                      onChange={(e) => setSettings(prev => ({ ...prev, canReschedule: e.target.checked }))}
                    />
                    Allow Rescheduling
                  </label>
                </div>
              </div>

              {seasonCalc.length > 0 && (
                <div className="season-calculation">
                  <h4>Season Overview</h4>
                  <div className="calc-grid">
                    <div className="calc-item">
                      <strong>Estimated Season Length:</strong> {seasonCalc.length} days
                    </div>
                    <div className="calc-item">
                      <strong>Games Per Time Window:</strong> {seasonCalc.gamesPerWindow}
                    </div>
                    <div className="calc-item">
                      <strong>Total Game Slots:</strong> {seasonCalc.totalGameSlots}
                    </div>
                  </div>
                </div>
              )}

              {seasonCalc.warning && (
                <div className="warning-message">
                  ⚠️ {seasonCalc.warning}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <div className="warning-box">
                <strong>⚠️ Warning:</strong> Season settings are immutable once created. 
                Please review all settings carefully before confirming.
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={handleCreateSeason}
                  disabled={!isFormValid()}
                >
                  Confirm & Create Season
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSeasons;
