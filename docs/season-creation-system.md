# Season Creation System Documentation

## Overview
The Season Creation System allows league administrators to configure and create new sports seasons for digital gaming leagues. Once created, season settings are **immutable** to ensure fairness and consistency throughout the season.

## Core Concepts

### Season Configuration Fields

#### Required Fields
- **Season Name**: Human-readable identifier for the season
- **Game**: The video game being played (e.g., "NHL 25", "FIFA 25")
- **Number of Players**: Total participants (must be even)
- **Number of Games**: Total games each player will play
- **Day Span Per Game**: Days available to complete each game

#### Optional Fields
- **Can Reschedule**: Whether players can reschedule games
- **Sports Type**: Auto-determined by game selection

### Game to Sports Type Mapping
```
NHL 25 → Hockey
FIFA 25 → Soccer  
NBA 2K25 → Basketball
Madden 25 → Football
```

## Season Length Calculation

### Formula
```
Season Length = Number of Games × Day Span Per Game
```

### Logic Explanation
1. **Simultaneous Games**: With even players, half can play simultaneously
   - Example: 8 players = 4 simultaneous games per time window

2. **Time Windows**: Each "round" of games gets its own time window
   - Players rotate opponents across multiple rounds
   - Number of rounds = Number of Games

3. **Flexibility**: Day span gives players scheduling flexibility
   - 3-day span = players have 3 days to complete their game
   - Accommodates different time zones and schedules

### Example Calculations

#### Scenario 1: Small League
- **Players**: 8
- **Games**: 10 
- **Day Span**: 3 days
- **Result**: ~30 day season (10 games × 3 days)
- **Games per window**: 4 simultaneous

#### Scenario 2: Large League  
- **Players**: 16
- **Games**: 15
- **Day Span**: 2 days  
- **Result**: ~30 day season (15 games × 2 days)
- **Games per window**: 8 simultaneous

## Validation Rules

### Player Count
- Must be even number (pairs needed for games)
- Minimum: 2 players
- No maximum limit

### Games Count
- Minimum: 1 game
- Practical maximum depends on player availability

### Day Span
- Minimum: 1 day
- Maximum: 7 days (recommended)
- Longer spans may reduce engagement

## Immutability Warning

### Why Settings Are Immutable
1. **Fairness**: Prevents mid-season rule changes
2. **Scheduling**: Game windows already calculated
3. **Player Expectations**: Consistent experience
4. **Data Integrity**: Avoids complex migration issues

### What Cannot Be Changed
- Number of players
- Number of games  
- Day span per game
- Game type
- Reschedule policy

### What Can Be Changed
- Player roster (add/remove players)
- Individual game scheduling within windows
- Season status (active/paused/completed)

## User Experience Flow

### 1. Access
- Navigate to "Manage Seasons" in sidebar
- Click "Create New Season" button

### 2. Configuration
- Fill required fields with validation
- See live calculation of season length
- Review auto-populated sports type

### 3. Confirmation
- Review warning about immutability
- Confirm settings are correct
- Click "Confirm & Create Season"

### 4. Creation
- Season immediately becomes active
- Players can be invited
- Games scheduling begins

## Technical Implementation

### Frontend Validation
```typescript
const isFormValid = () => {
  return seasonName.trim() && 
         game.trim() && 
         numberOfPlayers >= 2 && 
         numberOfPlayers % 2 === 0 &&
         numberOfGames >= 1 &&
         daySpanPerGame >= 1;
};
```

### Season Length Calculation
```typescript
const calculateSeasonLength = () => {
  const gamesPerTimeWindow = numberOfPlayers / 2;
  const seasonLengthDays = numberOfGames * daySpanPerGame;
  
  return {
    length: seasonLengthDays,
    gamesPerWindow: gamesPerTimeWindow,
    totalGameSlots: numberOfGames * gamesPerTimeWindow
  };
};
```

### Database Schema (Future)
```typescript
interface Season {
  id: string;
  name: string;
  game: string;
  sportsType: string;
  numberOfPlayers: number;
  numberOfGames: number;
  canReschedule: boolean;
  daySpanPerGame: number;
  createdAt: Date;
  status: 'draft' | 'active' | 'completed';
  ownerId: string;
}
```

## Error Handling

### Validation Errors
- Odd number of players
- Empty required fields  
- Invalid number ranges
- Game not selected

### System Errors
- API connection failures
- Database constraints
- Concurrent creation attempts

## Future Enhancements

### Planned Features
- Season templates for quick setup
- Advanced scheduling algorithms
- Playoff bracket generation
- Season statistics and reports
- Integration with game APIs for results

### Potential Improvements
- Dynamic player limits based on game type
- Advanced validation for game combinations
- Season cloning functionality
- Bulk operations for multiple seasons

## Best Practices

### For Season Creators
1. Plan player count carefully (cannot change)
2. Consider time zones when setting day spans
3. Communicate rules clearly to players
4. Test with small groups first

### For Development
1. Validate all inputs client and server-side
2. Provide clear error messages
3. Show calculation preview before creation
4. Log all season creation events for auditing
