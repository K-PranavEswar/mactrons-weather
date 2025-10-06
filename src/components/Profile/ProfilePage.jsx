import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    SunMedium, LayoutDashboard, Map, Settings, MessageSquare,
    Edit2, Plus, X, CheckCircle
} from 'lucide-react';

// --- BACKGROUNDS (for consistent feel) ---
const backgrounds = {
    Cloudy: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778172559421/cloudy.mp4?ex=667eb59c&is=667d641c&hm=a62a9aa7c88b77d6de76793a628532f62788f28c2670e9c85b1a32a677e48b94&',
};

// --- Reusable Components for Profile Page ---
const NavItem = ({ icon, text, to }) => (
    <li className="nav-item">
        <Link to={to} className="nav-link">
            <div className="nav-icon">{icon}</div>
            <span className="nav-text">{text}</span>
        </Link>
    </li>
);


const ProfileContainer = ({ title, children }) => (
    <div className="profile-container card">
        <h2 className="container-title">{title}</h2>
        <div className="container-content">
            {children}
        </div>
    </div>
);

// --- Main Profile Page Component ---
function ProfilePage() {
    // --- State Management for Profile Settings ---
    const [userName, setUserName] = useState(() => {
        // --- MODIFIED: Changed default username to 'MACTRONS' ---
        return localStorage.getItem('userProfileName') || 'MACTRONS';
    });
    
    const [userPhoto, setUserPhoto] = useState(() => {
        const savedPhoto = localStorage.getItem('userProfilePhoto');
        return savedPhoto || 'https://cdn.discordapp.com/attachments/1252909180790968413/1256247963383038084/default-avatar.png?ex=66800720&is=667eb5a0&hm=08412a3271295e8656e185b3068f05e2630a91617013b19124430e38a4d257b8&';
    });
    
    const [savedLocations, setSavedLocations] = useState(['Thiruvananthapuram', 'Mumbai', 'London']);
    const [newLocation, setNewLocation] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const fileInputRef = useRef(null);

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setUserPhoto(base64String);
                localStorage.setItem('userProfilePhoto', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNameChange = (event) => {
        const newName = event.target.value;
        setUserName(newName);
        localStorage.setItem('userProfileName', newName);
    };

    const handleAddLocation = () => {
        if (newLocation && !savedLocations.includes(newLocation)) {
            setSavedLocations([...savedLocations, newLocation]);
            setNewLocation('');
        }
    };

    const handleRemoveLocation = (locationToRemove) => {
        setSavedLocations(savedLocations.filter(loc => loc !== locationToRemove));
    };

    const handleSaveChanges = () => {
        console.log('Saving profile data:', { userName, userPhoto, savedLocations });
        setSaveStatus('Profile updated successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    return (
        <>
            <style>{`
                :root { --card-bg-color: rgba(15, 23, 42, 0.7); --accent-color: #00D1FF; --text-color: #e2e8f0; --text-muted-color: #94a3b8;}
                .background-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background-color: #0f172a; }
                .background-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
                .weather-dashboard { position: relative; z-index: 1; background-color: rgba(0,0,0,0.2); min-height: 100vh; width: 100%; color: var(--text-color); font-family: 'Inter', sans-serif; display: flex; box-sizing: border-box; }
                
                /* --- SIDEBAR STYLES (ADDED & MODIFIED) --- */
                .sidebar-nav { width: 250px; flex-shrink: 0; background-color: var(--card-bg-color); backdrop-filter: blur(20px); display: flex; flex-direction: column; justify-content: space-between; margin: 1rem; padding: 1.5rem; z-index: 20; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; }
                .sidebar-top { display: flex; flex-direction: column; gap: 2rem; }
                .logo-container { display: flex; align-items: center; gap: 0.75rem; color: white; padding-left: 0.5rem; font-size: 1.25rem; font-weight: 600; }
                .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1.5rem; }
                .nav-item { position: relative; }
                .nav-link { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 0.75rem; text-decoration: none; color: var(--text-muted-color); transition: all 0.3s ease; }
                .nav-link:hover, .nav-link.active { background-color: rgba(0, 209, 255, 0.1); color: white; }
                .nav-icon { display: flex; align-items: center; justify-content: center; }
                .sidebar-profile { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 0.75rem; background-color: rgba(0,0,0,0.2); }
                .sidebar-profile-photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color); }
                .sidebar-profile-info { display: flex; flex-direction: column; }
                .sidebar-username { color: white; font-weight: 500; font-size: 0.9rem; }
                .sidebar-status { color: #4ade80; font-size: 0.75rem; }
                /* --- END SIDEBAR STYLES --- */

                .card { position: relative; overflow: hidden; background-color: var(--card-bg-color); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; }
                .card::before { content: ''; position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-image: radial-gradient(circle at 25% 25%, rgba(0, 209, 255, 0.1), transparent 40%), radial-gradient(circle at 75% 75%, rgba(192, 0, 255, 0.1), transparent 40%); animation: aurora 10s linear infinite; z-index: -1; }
                @keyframes aurora { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .profile-content-wrapper { flex: 1; padding: 2rem; overflow-y: auto; }
                .profile-header { text-align: center; font-size: 2.5rem; font-weight: 700; margin-bottom: 3rem; }
                .profile-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; max-width: 800px; margin: 0 auto; }
                .profile-container { padding: 2rem; }
                .container-title { font-size: 1.5rem; font-weight: 600; margin: 0 0 2rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
                .container-content { display: flex; flex-direction: column; gap: 2rem; }
                
                /* --- MODIFIED: Styles for Centered Profile --- */
                .profile-details { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
                .photo-uploader { position: relative; }
                .photo-edit-btn { position: absolute; bottom: 5px; right: 5px; background-color: var(--accent-color); color: #0f172a; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.3s ease; }
                .photo-edit-btn:hover { transform: scale(1.1); }
                .profile-info { display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 350px; }
                .input-group { display: flex; flex-direction: column; width: 100%; }
                .input-label { color: var(--text-muted-color); margin-bottom: 0.5rem; font-size: 0.9rem; text-align: center; }
                /* --- END MODIFICATIONS --- */
                
                .text-input { background-color: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; color: var(--text-color); padding: 0.75rem 1rem; font-size: 1rem; }
                .text-input:focus { outline: none; border-color: var(--accent-color); }
                .location-list { display: flex; flex-direction: column; gap: 1rem; }
                .location-item { display: flex; justify-content: space-between; align-items: center; background-color: rgba(0,0,0,0.2); padding: 0.75rem 1rem; border-radius: 0.5rem; }
                .remove-location-btn { background: none; border: none; color: var(--text-muted-color); cursor: pointer; transition: color 0.3s ease; }
                .remove-location-btn:hover { color: #f87171; }
                .add-location { display: flex; gap: 1rem; margin-top: 1rem; }
                .add-location-btn { background-color: var(--accent-color); color: #0f172a; border: none; border-radius: 0.5rem; padding: 0 1rem; cursor: pointer; transition: opacity 0.3s ease; }
                .add-location-btn:hover { opacity: 0.9; }
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
                <main className="profile-content-wrapper">
                    <h1 className="profile-header">Profile & Locations</h1>
                    <div className="profile-grid">

                        <ProfileContainer title="User Profile">
                            <div className="profile-details">
                                <div className="photo-uploader">
                                    <img src={userPhoto} alt="User" className="profile-photo" />
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoUpload} 
                                        style={{ display: 'none' }} 
                                        accept="image/*"
                                    />
                                    <button className="photo-edit-btn" onClick={() => fileInputRef.current.click()}>
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                <div className="profile-info">
                                    <div className="input-group">
                                        <label className="input-label">Name</label>
                                        <input 
                                            type="text" 
                                            className="text-input" 
                                            value={userName} 
                                            onChange={handleNameChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </ProfileContainer>

                        <ProfileContainer title="Saved Locations">
                           <div className="location-list">
                                {savedLocations.map(loc => (
                                    <div key={loc} className="location-item">
                                        <span>{loc}</span>
                                        <button className="remove-location-btn" onClick={() => handleRemoveLocation(loc)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="add-location">
                                <input
                                    type="text"
                                    className="text-input"
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    placeholder="Add a new city..."
                                    style={{ flex: 1 }}
                                />
                                <button className="add-location-btn" onClick={handleAddLocation}>
                                    <Plus size={20} />
                                </button>
                            </div>
                        </ProfileContainer>
                        
                    </div>
                    <div className="save-button-container">
                        <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
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

export default ProfilePage;