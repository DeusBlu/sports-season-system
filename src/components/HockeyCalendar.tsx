import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, type View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './HockeyCalendar.css';
import { dataService } from '../services/dataService';
import type { HockeyGame } from '../services/dataService';

const localizer = momentLocalizer(moment);

const HockeyCalendar: React.FC = () => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [games, setGames] = useState<HockeyGame[]>([]);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const gameData = await dataService.getGames();
        setGames(gameData);
      } catch (error) {
        console.error('Failed to load games:', error);
      }
    };

    loadGames();
  }, []);

  const eventStyleGetter = (event: HockeyGame) => {
    let backgroundColor = '#1e90ff'; // Default blue
    let color = 'white';
    let border = '2px solid #1e90ff';

    if (event.isMyGame) {
      backgroundColor = '#ff6600'; // Orange for my games
      color = 'black';
      border = '2px solid #ff6600';
    }

    if (event.gameType === 'completed') {
      backgroundColor = '#28a745'; // Green for completed
      border = '2px solid #28a745';
    } else if (event.gameType === 'cancelled') {
      backgroundColor = '#dc3545'; // Red for cancelled
      border = '2px solid #dc3545';
    }

    return {
      style: {
        backgroundColor,
        color,
        border,
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
      }
    };
  };

  const CustomEvent: React.FC<{ event: HockeyGame }> = ({ event }) => (
    <div className="custom-event">
      <div className="event-title">
        {event.title}
        {event.isMyGame && (
          <span className={`home-away-indicator ${event.isHome ? 'home' : 'away'}`}>
            {event.isHome ? '🏠' : '✈️'}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="hockey-calendar">
      <div className="calendar-header">
        <h3>Hockey Schedule</h3>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color my-games"></span>
            <span>My Games</span>
          </div>
          <div className="legend-item">
            <span className="legend-color other-games"></span>
            <span>Other Games</span>
          </div>
        </div>
      </div>
      
      <Calendar
        localizer={localizer}
        events={games}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CustomEvent,
        }}
        popup
        showMultiDayTimes
        step={60}
        showAllEvents
      />
    </div>
  );
};

export default HockeyCalendar;
