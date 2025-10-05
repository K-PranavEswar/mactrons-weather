// App.js
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './components/Home/Home';
import ProfilePage from './components/Profile/ProfilePage';
import MapPage from './components/Map/MapPage'; 
import SettingsPage from './components/Settings/Settings';

// Sidebar
import Sidebar from './components/Sidebar/Sidebar';
import './components/Sidebar/Sidebar.css'; // Sidebar CSS
import ChatbotPage from './pages/ChatbotPage';

function App() {
  // Global state
  const [location, setLocation] = useState('Thiruvananthapuram');
  const [userName, setUserName] = useState('Alex Mercer');
  const [userPhoto, setUserPhoto] = useState(
    'https://cdn.discordapp.com/attachments/1252909180790968413/1256247963383038084/default-avatar.png?ex=66800720&is=667eb5a0&hm=08412a3271295e8656e185b3068f05e2630a91617013b19124430e38a4d257b8&'
  );
  const [savedLocations, setSavedLocations] = useState(['Thiruvananthapuram', 'Mumbai', 'London']);

  return (
    <div className="App">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Page Content */}
      <div className="page-content" style={{ marginLeft: '80px' }}> {/* leave space for sidebar */}
        <Routes>
          {/* Home Page */}
          <Route 
            path="/" 
            element={
              <Home 
                location={location} 
                onLocationChange={setLocation}
                userName={userName}
                userPhoto={userPhoto}
              />
            } 
          />

          {/* Profile Page */}
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                userName={userName}
                userPhoto={userPhoto}
                savedLocations={savedLocations}
                onUserNameChange={setUserName}
                onUserPhotoChange={setUserPhoto}
                onSavedLocationsChange={setSavedLocations}
              />
            }
          />

          {/* Map Page */}
          <Route 
            path="/map" 
            element={
              <MapPage 
                location={location} 
                onLocationChange={setLocation} 
              />
            } 
          />

          {/* Settings Page */}
          <Route 
            path="/settings" 
            element={
              <SettingsPage 
                currentLocation={location} 
                onLocationChange={setLocation} 
              />
            } 
          />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
