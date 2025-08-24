import React from 'react';

const Hockey: React.FC = () => {
  return (
    <div className="page-content">
      <h2>Hockey Season</h2>
      <p>Welcome to your hockey season tracking dashboard.</p>
      <div className="content-card">
        <h3>Getting Started</h3>
        <p>Use the navigation to manage your hockey season activities:</p>
        <ul>
          <li>📅 <strong>Schedule</strong> - View and manage your games</li>
        </ul>
      </div>
    </div>
  );
};

export default Hockey;
