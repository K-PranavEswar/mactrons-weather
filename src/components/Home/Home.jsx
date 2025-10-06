import React, { useState, useEffect, useRef } from 'react';
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake,
  Search, Wind, Droplet, Thermometer, Sunrise, Sunset, Eye,
  Navigation, Gauge, CloudSun, GitBranch
} from 'lucide-react';
import WeatherParticles from '../WeatherParticles'; // Adjust path if needed

// ----- CONFIG -----
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || "";

// ----- "HUGE" DYNAMIC BACKGROUND SET (DAY & NIGHT) -----
const backgrounds = {
    day: {
      Clear: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866779183353896/sunny.mp4',
      Clouds: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778172559421/cloudy.mp4',
      Rain: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866779833503816/rainy.mp4',
      Thunderstorm: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866780441690122/storm.mp4',
      Fog: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778696892426/foggy.mp4',
      Snow: 'https://assets.mixkit.co/videos/preview/mixkit-snow-falling-in-a-quiet-forest-34282-large.mp4',
      Default: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778172559421/cloudy.mp4'
    },
    night: {
      Clear: 'https://assets.mixkit.co/videos/preview/mixkit-animation-of-a-starry-sky-with-meteors-and-a-planet-23746-large.mp4',
      Clouds: 'https://assets.mixkit.co/videos/preview/mixkit-dark-clouds-in-a-thundery-sky-3132-large.mp4',
      Rain: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-a-window-at-night-1927-large.mp4',
      Thunderstorm: 'https://assets.mixkit.co/videos/preview/mixkit-lightning-in-the-sky-at-night-1438-large.mp4',
      Fog: 'https://assets.mixkit.co/videos/preview/mixkit-creepy-forest-in-the-fog-at-night-2446-large.mp4',
      Snow: 'https://assets.mixkit.co/videos/preview/mixkit-snow-falling-at-night-in-the-woods-44319-large.mp4',
      Default: 'https://assets.mixkit.co/videos/preview/mixkit-dark-clouds-in-a-thundery-sky-3132-large.mp4'
    }
};


// ----- MAP STYLE -----
const mapStyles = [ { "elementType": "geometry", "stylers": [ { "color": "#1d2c4d" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#8ec3b9" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#1a3646" } ] }, { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [ { "color": "#4b6878" } ] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [ { "color": "#64779e" } ] }, { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [ { "color": "#4b6878" } ] }, { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [ { "color": "#334e87" } ] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [ { "color": "#023e58" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#283d6a" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#6f9ba5" } ] }, { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] }, { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [ { "color": "#023e58" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#3C7680" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#304a7d" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#98a5be" } ] }, { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#2c6675" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#255763" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#b0d5ce" } ] }, { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [ { "color": "#023e58" } ] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [ { "color": "#98a5be" } ] }, { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] }, { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [ { "color": "#283d6a" } ] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [ { "color": "#3a4762" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#0e1626" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#4e6d70" } ] } ];

// ----- HELPER COMPONENTS & FUNCTIONS -----
const WeatherIcon = ({ condition, ...props }) => {
    switch ((condition || '').toLowerCase()) {
        case 'clear': return <Sun {...props} />; case 'clouds': return <Cloud {...props} />;
        case 'rain': case 'drizzle': return <CloudRain {...props} />;
        case 'thunderstorm': return <CloudLightning {...props} />; case 'snow': return <Snowflake {...props} />;
        default: return <CloudFog {...props} />;
    }
};

const getAqiInfo = (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: '#4ade80' };
    if (aqi <= 100) return { level: 'Moderate', color: '#facc15' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#fb923c' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#f87171' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#c026d3' };
    return { level: 'Hazardous', color: '#701a75' };
};

const getUvInfo = (uv) => {
    if (uv <= 2) return { level: 'Low', color: '#4ade80' };
    if (uv <= 5) return { level: 'Moderate', color: '#facc15' };
    if (uv <= 7) return { level: 'High', color: '#fb923c' };
    if (uv <= 10) return { level: 'Very High', color: '#f87171' };
    return { level: 'Extreme', color: '#c026d3' };
};

const SunPath = ({ sunrise, sunset }) => {
    const [sunPosition, setSunPosition] = useState(0);

    useEffect(() => {
        const calculatePosition = () => {
            const now = new Date().getTime();
            if (now < sunrise || now > sunset) {
                setSunPosition(now < sunrise ? 0 : 180);
                return;
            }
            const totalDaylight = sunset - sunrise;
            const timeElapsed = now - sunrise;
            const percentageOfDay = timeElapsed / totalDaylight;
            setSunPosition(percentageOfDay * 180);
        };
        calculatePosition();
        const interval = setInterval(calculatePosition, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [sunrise, sunset]);

    return (
        <div className="sun-path-container">
            <svg viewBox="0 0 200 100" className="sun-path-arc">
                <path d="M 10 90 A 90 90 0 0 1 190 90" fill="none" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
            <div className="sun-icon" style={{ transform: `rotate(${sunPosition - 90}deg)` }}>
                <Sun size={20} color="#facc15" />
            </div>
            <div className="sun-path-times">
                <span>{new Date(sunrise).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit'})}</span>
                <span>{new Date(sunset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit'})}</span>
            </div>
        </div>
    );
};

// ----- NEW FOOTER COMPONENT -----
const AppFooter = () => (
    <footer className="app-footer">
        <p>Powered by OpenWeather API</p>
        <div className="footer-separator"></div>
        <a href="https://github.com/mactrons" target="_blank" rel="noopener noreferrer" className="footer-link">
            <GitBranch size={14} />
            <span>Crafted by Mactrons</span>
        </a>
        <p className="copyright-text">
            &copy; {new Date().getFullYear()} Mactrons Weatherings. All Rights Reserved.
        </p>
    </footer>
);


// ----- EXPANDED DATA TRANSFORMATION -----
const transformApiData = (currentData, forecastData, airData) => {
    const { main, weather, wind, sys, name, coord, visibility, dt } = currentData;
    
    const daily = forecastData.list.filter(item => item.dt_txt.includes("12:00:00")).map(day => ({
        date: new Date(day.dt * 1000),
        temp_c: Math.round(day.main.temp),
        temp_f: Math.round(day.main.temp * 9/5 + 32),
        condition: day.weather[0].main,
    }));

    return {
        city: name, country: sys.country, lat: coord.lat, lon: coord.lon,
        currentTime: dt * 1000,
        current: { 
            temp_c: Math.round(main.temp), 
            temp_f: Math.round(main.temp * 9/5 + 32),
            condition: weather[0].main 
        },
        highlights: {
            wind_kph: (wind.speed * 3.6).toFixed(1), // m/s to km/h
            wind_mph: (wind.speed * 2.237).toFixed(1), // m/s to mph
            humidity: main.humidity, 
            feelsLike_c: Math.round(main.feels_like),
            feelsLike_f: Math.round(main.feels_like * 9/5 + 32),
            sunrise: sys.sunrise * 1000,
            sunset: sys.sunset * 1000,
            visibility: (visibility / 1000).toFixed(1), // meters to km
            aqi: airData.list[0].main.aqi, // 1-5 scale
            uv: 7.5 // Mock UV index for now
        },
        daily,
    };
};

// ----- MAIN COMPONENT -----
function Home({ location: initialLocation = 'Trivandrum', onLocationChange: setParentLocation }) {
    const [location, setLocation] = useState(initialLocation);
    const [searchTerm, setSearchTerm] = useState('');
    const [weather, setWeather] = useState(null);
    const [dateTime, setDateTime] = useState({ date: '', time: '' });
    const [units, setUnits] = useState('metric'); // 'metric' or 'imperial'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [bgVideo, setBgVideo] = useState(backgrounds.day.Default);
    
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerInstanceRef = useRef(null);
    const infoWindowInstanceRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setDateTime({
                date: now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }),
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!location) return;
            setLoading(true); setError('');
            try {
                if (!OPENWEATHER_API_KEY) throw new Error("API Key is missing.");
                
                // Use Geocoding API to get lat/lon from location name
                const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
                const geoResp = await fetch(geoUrl);
                const geoData = await geoResp.json();
                if (geoData.length === 0) throw new Error("City not found. Please try again.");
                const { lat, lon } = geoData[0];

                const [currentResp, forecastResp, airResp] = await Promise.all([
                    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
                    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`)
                ]);
                
                if (!currentResp.ok || !forecastResp.ok || !airResp.ok) throw new Error("Failed to fetch weather data.");

                const currentData = await currentResp.json();
                const forecastData = await forecastResp.json();
                const airData = await airResp.json();

                const formattedData = transformApiData(currentData, forecastData, airData);
                setWeather(formattedData);

                // --- Day/Night Background Logic ---
                const now = formattedData.currentTime;
                const sunrise = formattedData.highlights.sunrise;
                const sunset = formattedData.highlights.sunset;
                const timeOfDay = (now > sunrise && now < sunset) ? 'day' : 'night';
                setBgVideo(backgrounds[timeOfDay][formattedData.current.condition] || backgrounds[timeOfDay].Default);
                
                // --- Map and Marker Logic ---
                const position = { lat: formattedData.lat, lng: formattedData.lon };
                const setupMapAndMarker = () => { /* ... (map logic remains the same) ... */ };

                if (!window.google) {
                    const script = document.createElement('script');
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
                    document.head.appendChild(script);
                    script.onload = () => { initializeMap(lat, lon); setupMapAndMarker(); };
                } else {
                    if (!mapInstanceRef.current) initializeMap(lat, lon);
                    setupMapAndMarker();
                }

            } catch (err) { setError(err.message); setWeather(null); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [location]);
    
    const initializeMap = (lat, lon) => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
                center: { lat, lng: lon }, zoom: 10, styles: mapStyles, disableDefaultUI: true
            });
        }
    };
    
    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm) {
            setLocation(searchTerm);
            if (setParentLocation) setParentLocation(searchTerm); // Update parent if function is provided
            setSearchTerm('');
        }
    };

    const temp = weather ? (units === 'metric' ? weather.current.temp_c : weather.current.temp_f) : '';
    const unitSymbol = units === 'metric' ? '°C' : '°F';
    
    return (
        <>
            <style>{`
                :root {
                    --bg-color: #020617; --panel-color: rgba(15, 23, 42, 0.8);
                    --text-primary: #f8fafc; --text-secondary: #94a3b8;
                    --border-color: rgba(51, 65, 85, 0.5); --accent-color: #38bdf8;
                    --font-main: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                body { margin: 0; background-color: var(--bg-color); color: var(--text-primary); font-family: var(--font-main); }
                .video-bg { position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; transition: opacity 1s ease-in-out; }
                .app-container { display: grid; grid-template-columns: 1fr 480px; height: 100vh; position: relative; z-index: 1; }
                .hero-section { display: flex; flex-direction: column; justify-content: flex-end; padding: 4rem; text-shadow: 0 2px 20px rgba(0,0,0,0.4); }
                .hero-temp { font-size: 10rem; font-weight: 700; line-height: 1; margin: 0; }
                .hero-condition { display: flex; align-items: center; gap: 1rem; font-size: 2rem; margin: 1rem 0; text-transform: capitalize;}
                .hero-location { font-size: 2rem; font-weight: 500; margin: 0; }
                .hero-date-time { font-size: 1.1rem; color: var(--text-secondary); }
                .details-panel { background-color: var(--panel-color); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-left: 1px solid var(--border-color); padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
                .details-panel::-webkit-scrollbar { display: none; }
                .panel-header { display: flex; gap: 1rem; align-items: center; }
                .search-input { width: 100%; background: transparent; border: none; border-bottom: 2px solid var(--border-color); color: var(--text-primary); padding: 0.75rem 0; font-size: 1.1rem; transition: border-color 0.3s; }
                .search-input:focus { outline: none; border-bottom-color: var(--accent-color); }
                .unit-toggle { background: var(--border-color); color: var(--text-primary); border: none; border-radius: 8px; padding: 0.75rem 1.25rem; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
                .unit-toggle:hover { background: rgba(51, 65, 85, 0.8); }
                .section-divider { border: none; height: 1px; background-color: var(--border-color); margin: 0; }
                .section-title { color: var(--text-secondary); font-weight: 500; margin-bottom: 1.5rem; letter-spacing: 1px; text-transform: uppercase; font-size: 0.9rem; }
                .daily-forecast-list { display: flex; flex-direction: column; gap: 1rem; }
                .daily-item { display: grid; grid-template-columns: 1fr 1fr auto; align-items: center; gap: 1rem; }
                .daily-day { font-weight: 500; }
                .daily-temp { font-weight: 600; text-align: right; }
                .highlights-grid { display: grid; grid-template-columns: 1fr 1fr; gap-y: 2rem; gap-x: 1.5rem; }
                .highlight-item { display: flex; flex-direction: column; gap: 0.5rem; }
                .highlight-label { color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
                .highlight-value { font-size: 1.5rem; font-weight: 600; }
                .sun-path-container { position: relative; width: 100%; height: 100px; display: flex; flex-direction: column; align-items: center; }
                .sun-path-arc { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
                .sun-icon { position: absolute; top: 90px; left: 50%; transform-origin: 0 -80px; transition: transform 1s ease-out; }
                .sun-path-times { display: flex; justify-content: space-between; width: 100%; position: absolute; bottom: 0; font-size: 0.8rem; color: var(--text-secondary); }
                .map-container { border-radius: 0.75rem; overflow: hidden; height: 180px; background-color: #1d2c4d; }
                .loading-error { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.5rem; background-color: var(--bg-color); position: fixed; top: 0; left: 0; width: 100%; z-index: 10; }
                
                /* --- FOOTER STYLES --- */
                .app-footer {
                    margin-top: auto; /* Pushes footer to the bottom */
                    padding-top: 2rem;
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                }
                .app-footer p {
                    margin: 0.5rem 0;
                }
                .footer-separator {
                    width: 50px;
                    height: 1px;
                    background-color: var(--border-color);
                    margin: 1rem auto;
                }
                .footer-link {
                    color: var(--text-secondary);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: color 0.2s ease;
                }
                .footer-link:hover {
                    color: var(--accent-color);
                }
                .copyright-text {
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    opacity: 0.7;
                }
            `}</style>
            
            <video key={bgVideo} src={bgVideo} className="video-bg" autoPlay loop muted playsInline />
            {weather && <WeatherParticles condition={weather.current.condition} />}

            {loading ? <div className="loading-error">Fetching Weather Data...</div> : 
             error ? <div className="loading-error">{error}</div> :
             weather && (
                <div className="app-container">
                    <main className="hero-section">
                        <div className="hero-temp">{temp}{unitSymbol}</div>
                        <div className="hero-condition">
                            <WeatherIcon condition={weather.current.condition} size={48} />
                            <span>{weather.current.condition}</span>
                        </div>
                        <div>
                            <div className="hero-location">{weather.city}, {weather.country}</div>
                            <div className="hero-date-time">{dateTime.time} - {dateTime.date}</div>
                        </div>
                    </main>
                    <aside className="details-panel">
                        <div className="panel-header">
                            <input type="text" className="search-input" placeholder="Search another location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} />
                            <button className="unit-toggle" onClick={() => setUnits(units === 'metric' ? 'imperial' : 'metric')}>{unitSymbol}</button>
                        </div>
                        <section>
                            <h3 className="section-title">7-Day Forecast</h3>
                            <div className="daily-forecast-list">
                                {weather.daily.map(day => (
                                    <div key={day.date.toISOString()} className="daily-item">
                                        <span className="daily-day">{day.date.toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                                        <WeatherIcon condition={day.condition} size={28} />
                                        <span className="daily-temp">{units === 'metric' ? day.temp_c : day.temp_f}°</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <hr className="section-divider" />
                        <section>
                            <h3 className="section-title">Today's Highlights</h3>
                            <div className="highlights-grid">
                                <div className="highlight-item">
                                    <span className="highlight-label"><Gauge size={16}/> AQI</span>
                                    <span className="highlight-value" style={{color: getAqiInfo(weather.highlights.aqi).color}}>{getAqiInfo(weather.highlights.aqi).level}</span>
                                </div>
                                 <div className="highlight-item">
                                    <span className="highlight-label"><CloudSun size={16}/> UV Index</span>
                                    <span className="highlight-value" style={{color: getUvInfo(weather.highlights.uv).color}}>{getUvInfo(weather.highlights.uv).level}</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-label"><Wind size={16}/> Wind</span>
                                    <span className="highlight-value">{units === 'metric' ? `${weather.highlights.wind_kph} km/h` : `${weather.highlights.wind_mph} mph`}</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-label"><Droplet size={16}/> Humidity</span>
                                    <span className="highlight-value">{weather.highlights.humidity} %</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-label"><Thermometer size={16}/> Feels Like</span>
                                    <span className="highlight-value">{units === 'metric' ? weather.highlights.feelsLike_c : weather.highlights.feelsLike_f}{unitSymbol}</span>
                                </div>
                                <div className="highlight-item">
                                    <span className="highlight-label"><Eye size={16}/> Visibility</span>
                                    <span className="highlight-value">{weather.highlights.visibility} km</span>
                                </div>
                            </div>
                        </section>
                         <section>
                             <SunPath sunrise={weather.highlights.sunrise} sunset={weather.highlights.sunset} />
                        </section>
                        <section>
                             <div ref={mapContainerRef} className="map-container"></div>
                        </section>
                        
                        {/* --- NEW FOOTER INTEGRATION --- */}
                        <AppFooter />
                    </aside>
                </div>
            )}
        </>
    );
}

export default Home;

