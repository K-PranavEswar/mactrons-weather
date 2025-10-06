import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Component - This wraps pages to provide a consistent sidebar.
import Layout from './components/Layout/Layout';

// --- Lazy Load Page Components ---
// This improves performance by only loading the code for a page when it's needed.
const Home = lazy(() => import('./components/Home/Home'));
const ProfilePage = lazy(() => import('./components/Profile/ProfilePage'));
const MapPage = lazy(() => import('./components/Map/MapPage'));
const SettingsPage = lazy(() => import('./components/Settings/Settings'));
const ChatbotPage = lazy(() => import('./pages/ChatbotPage'));

// --- Loading Fallback Component ---
// A simple loading message shown while page components are being loaded.
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#020617', // Matches modern theme
    color: '#f8fafc',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '1.2rem'
  }}>
    <h2>Loading Mactrons Weatherings...</h2>
  </div>
);

function App() {
  // All global state (like user info and location) is now managed by Redux.
  // This keeps the main App component clean and focused on routing.
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* This is a layout route. All nested routes (<Route path="...">) 
          will render inside the <Layout /> component, which contains the sidebar.
        */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Route>
        
        {/* You can add routes here that DON'T need the sidebar, e.g., a login page */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </Suspense>
  );
}

export default App;

