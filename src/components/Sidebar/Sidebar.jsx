import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Settings, MessageCircle, Sun } from 'lucide-react';
import './Sidebar.css'; 

import userAvatar from '../../assets/team.png'; 

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Map, label: 'Map', path: '/map' },
    { icon: MessageCircle, label: 'Chatbot', path: '/chatbot' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const user = {
    name: 'MACTRONS',
    photo: userAvatar 
  };

  return (
    <nav 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <Sun className="sidebar-logo" size={32} />
        <span className="sidebar-title">MACTRONS</span>
      </div>

      <ul className="sidebar-menu">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.label} className={`menu-item ${isActive ? 'active' : ''}`}>
              <Link to={item.path} className="menu-link" title={isExpanded ? '' : item.label}>
                <item.icon className="menu-icon" size={24} />
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          );
        })}

        {/* --- MODIFICATION: Profile link moved into the menu list --- */}
        <li className="menu-item">
            <Link to="/profile" className="profile-link">
              <img src={user.photo} alt="User" className="profile-photo" />
              <div className="profile-details">
                <span className="profile-name">{user.name}</span>
                <span className="profile-status">Online</span>
              </div>
            </Link>
        </li>
      </ul>

      {/* The sidebar-footer div has been removed */}
    </nav>
  );
};

export default Sidebar;