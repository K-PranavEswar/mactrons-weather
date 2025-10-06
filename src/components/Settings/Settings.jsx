import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Map, Settings, User,
    ChevronDown, CheckCircle
} from 'lucide-react';

// Import CitySearch component
import CitySearch from "../Search/CitySearch";

// --- BACKGROUNDS ---
const backgrounds = {
    Cloudy: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778172559421/cloudy.mp4?ex=667eb59c&is=667d641c&hm=a62a9aa7c88b77d6de76793a628532f62788f28c2670e9c85b1a32a677e48b94&',
};

// --- Reusable Components ---
const NavItem = ({ icon }) => (
    <li className="nav-item">
        <div className="nav-icon">{icon}</div>
    </li>
);

const SettingsContainer = ({ title, children }) => (
    <div className="settings-container card">
        <h2 className="container-title">{title}</h2>
        <div className="container-content">
            {children}
        </div>
    </div>
);

const SettingsRow = ({ label, children }) => (
    <div className="settings-row">
        <span className="setting-label">{label}</span>
        <div className="setting-control">
            {children}
        </div>
    </div>
);

const ToggleButton = ({ options, selected, onSelect }) => (
    <div className="toggle-group">
        {options.map(option => (
            <button
                key={option}
                className={`toggle-btn ${selected === option ? 'active' : ''}`}
                onClick={() => onSelect(option)}
            >
                {option}
            </button>
        ))}
    </div>
);

// --- Main Settings Page ---
function SettingsPage() {
    const [currentCity, setCurrentCity] = useState('');
    const [tempUnit, setTempUnit] = useState('Celsius (°C)');
    const [hourlyInterval, setHourlyInterval] = useState('1 Hour');
    const [forecastFormat, setForecastFormat] = useState('Line Chart');
    const [saveStatus, setSaveStatus] = useState('');

    const handleSave = () => {
        console.log('Saving settings:', { currentCity, tempUnit, hourlyInterval, forecastFormat });
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    return (
        <>
            <style>{`
                :root { --card-bg-color: rgba(15, 23, 42, 0.7); --accent-color: #00D1FF; --text-color: #e2e8f0; --text-muted-color: #94a3b8;}
                .background-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background-color: #0f172a; }
                .background-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
                .weather-dashboard { position: relative; z-index: 1; background-color: rgba(0,0,0,0.2); min-height: 100vh; width: 100%; color: var(--text-color); font-family: 'Inter', sans-serif; display: flex; }
                .sidebar-nav { flex-shrink: 0; background-color: var(--card-bg-color); backdrop-filter: blur(20px); border-radius: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: space-between; margin: 1rem; padding: 1.5rem 1rem; z-index: 20; border: 1px solid rgba(255, 255, 255, 0.1); }
                .sidebar-nav a { text-decoration: none; color: inherit; }
                .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2rem; }
                .nav-item { display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .nav-icon { color: var(--text-muted-color); transition: all 0.3s ease; }
                .nav-item:hover .nav-icon { color: white; }
                .card { background-color: var(--card-bg-color); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; }
                .settings-content-wrapper { flex: 1; padding: 2rem; overflow-y: auto; }
                .settings-header { text-align: center; font-size: 2.5rem; font-weight: 700; margin-bottom: 3rem; }
                .settings-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 800px; margin: 0 auto; }
                .settings-container { padding: 2rem; }
                .container-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 2rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
                .container-content { display: flex; flex-direction: column; gap: 1.5rem; }
                .settings-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
                .setting-label { color: var(--text-muted-color); font-size: 1rem; }
                .setting-control { display: flex; align-items: center; }
                .toggle-group { display: flex; background-color: rgba(0,0,0,0.2); border-radius: 0.5rem; padding: 4px; }
                .toggle-btn { background-color: transparent; border: none; color: var(--text-muted-color); padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; transition: all 0.3s ease; font-weight: 500; }
                .toggle-btn.active { background-color: var(--accent-color); color: #0f172a; box-shadow: 0 0 10px rgba(0, 209, 255, 0.5); }
                .about-row { display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
                .about-title { font-size: 1.1rem; font-weight: 500; }
                .about-text { color: var(--text-muted-color); font-size: 0.9rem; }
                .save-button-container { display: flex; justify-content: center; align-items: center; margin-top: 2rem; gap: 1rem; }
                .save-btn { background-color: var(--accent-color); color: #0f172a; font-weight: 600; font-size: 1rem; padding: 0.75rem 2rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.3s ease; }
                .save-btn:hover { background-color: #fff; box-shadow: 0 0 15px rgba(0, 209, 255, 0.7); }
                .save-status { color: #4ade80; display: flex; align-items: center; gap: 0.5rem; animation: fadeIn 0.5s ease; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            <div className="background-container">
                <video key={backgrounds.Cloudy} src={backgrounds.Cloudy} className="background-video" autoPlay loop muted playsInline />
            </div>

            <div className="weather-dashboard">
                <main className="settings-content-wrapper">
                    <h1 className="settings-header">Settings</h1>
                    <div className="settings-grid">

                        <SettingsContainer title="General">
                            <SettingsRow label="Current City">
                                {/* 🔎 Updated to use CitySearch */}
                                <CitySearch selected={currentCity} onSelect={setCurrentCity} />
                            </SettingsRow>
                            <SettingsRow label="Temperature Unit">
                                <ToggleButton 
                                    options={['Celsius (°C)', 'Fahrenheit (°F)']}
                                    selected={tempUnit}
                                    onSelect={setTempUnit}
                                />
                            </SettingsRow>
                        </SettingsContainer>

                        <SettingsContainer title="Forecast">
                            <SettingsRow label="Hourly Forecast Interval">
                                <ToggleButton 
                                    options={['1 Hour', '2 Hours']}
                                    selected={hourlyInterval}
                                    onSelect={setHourlyInterval}
                                />
                            </SettingsRow>
                            <SettingsRow label="Multi-day Forecast Format">
                                <ToggleButton 
                                    options={['List', 'Line Chart']}
                                    selected={forecastFormat}
                                    onSelect={setForecastFormat}
                                />
                            </SettingsRow>
                        </SettingsContainer>
                        
                        <SettingsContainer title="About">
                            <div className="about-row">
                                <h3 className="about-title">User Agreement</h3>
                                <p className="about-text">Licenses and verifications go here. By using this application, you agree to our terms of service.</p>
                            </div>
                             <div className="about-row">
                                <h3 className="about-title">Privacy & Terms</h3>
                                <p className="about-text">Privacy policy, terms, and conditions go here. We are committed to protecting your data.</p>
                            </div>
                        </SettingsContainer>

                    </div>
                    <div className="save-button-container">
                        <button className="save-btn" onClick={handleSave}>Save Changes</button>
                        {saveStatus && (
                            <span className="save-status">
                                <CheckCircle size={20} />
                                {saveStatus}
                            </span>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

export default SettingsPage;
