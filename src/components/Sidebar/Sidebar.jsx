import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Settings, User, MessageCircle } from 'lucide-react'; // Import MessageCircle

const Sidebar = () => {
  // --- Start: Configuration Update ---
  const sections = [
    { name: 'dashboard', path: '/' },
    { name: 'map', path: '/map' },
    { name: 'settings', path: '/settings' },
    { name: 'profile', path: '/profile' },
    { name: 'chatbot', path: '/chatbot' }, // Added Chatbot section
  ];

  const iconMap = {
    dashboard: LayoutDashboard,
    map: Map,
    settings: Settings,
    profile: User,
    chatbot: MessageCircle, // Map the new icon
  };
  // --- End: Configuration Update ---

  const location = useLocation();

  // Placeholder for dynamic username (replace 'there' with actual user state)
  const username = 'there';
  const tooltipMessage = `Hi ${username}, What kind of help do you need?`;

  return (
    <nav className="sidebar-nav">
      <ul className="nav-list">
        {sections.map((section) => {
          const Icon = iconMap[section.name];
          const isActive = location.pathname === section.path;
          const isChatbot = section.name === 'chatbot';

          return (
            <li
              key={section.name}
              className={`nav-item ${isActive ? 'active' : ''} ${isChatbot ? 'has-tooltip' : ''}`} // Add has-tooltip class for CSS
            >
              <Link to={section.path} className="nav-link">
                <Icon
                  className="nav-icon"
                  size={24}
                  style={{
                    transform: isActive ? 'translateY(5px)' : 'translateY(0)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </Link>
              {/* --- Start: Tooltip Logic --- */}
              {isChatbot && (
                <span className="tooltip-text">
                  {tooltipMessage}
                </span>
              )}
              {/* --- End: Tooltip Logic --- */}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;