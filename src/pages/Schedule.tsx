import React from 'react';
import HockeyCalendar from '../components/HockeyCalendar';

const Schedule: React.FC = () => {
  return (
    <div className="page-content">
      <h2>Hockey Schedule</h2>
      <p>Manage your hockey games and view your schedule in calendar format.</p>
      
      <HockeyCalendar />
      
      <div className="content-card" style={{ marginTop: '2rem' }}>
        <h3>Schedule Features</h3>
        <ul>
          <li>🏒 <strong>My Games</strong> - Highlighted in orange, these are games you're participating in</li>
          <li>👥 <strong>Other Games</strong> - Blue games are other matches in your league</li>
          <li>🏠 <strong>Home Games</strong> - House icon indicates you're the home team</li>
          <li>✈️ <strong>Away Games</strong> - Plane icon indicates you're playing away</li>
          <li>📅 <strong>Multi-day Windows</strong> - Games can span 2-3 days for flexible scheduling</li>
          <li>🎮 <strong>Digital Matches</strong> - All games are played online in video game format</li>
          <li>📱 <strong>Multiple Views</strong> - Switch between Month, Week, Day, and Agenda views</li>
        </ul>
      </div>
    </div>
  );
};

export default Schedule;
