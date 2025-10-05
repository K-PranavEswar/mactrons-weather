import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import mactronsLogo from '../../assets/team.png'; // adjust path if necessary
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake,
  Search, MapPin, Sunrise, Sunset, Wind, Droplet,
  LayoutDashboard, Map, Settings, Bell, User, SunMedium,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// ----- CONFIG -----
const GOOGLE_MAPS_API_KEY = "AIzaSyDhGDWyAuh-cfsEvlo_79G8I_RboMGyP1M";
const OPENWEATHER_API_KEY = "4bf1e31f3791b343421a2896777a528c";

// ----- BACKGROUNDS -----
const backgrounds = {
  Clear: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866779183353896/sunny.mp4',
  Clouds: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778172559421/cloudy.mp4',
  Rain: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866779833503816/rainy.mp4',
  Thunderstorm: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866780441690122/storm.mp4',
  Fog: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778696892426/foggy.mp4',
  Snow: 'https://assets.mixkit.co/videos/preview/mixkit-snow-falling-in-a-quiet-forest-34282-large.mp4',
  Default: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778172559421/cloudy.mp4'
};

// ----- MAP STYLE (kept same as you had) -----
const mapStyles = [
  { "elementType": "geometry", "stylers": [ { "color": "#1d2c4d" } ] },
  { "elementType": "labels.text.fill", "stylers": [ { "color": "#8ec3b9" } ] },
  { "elementType": "labels.text.stroke", "stylers": [ { "color": "#1a3646" } ] },
  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [ { "color": "#4b6878" } ] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [ { "color": "#64779e" } ] },
  { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [ { "color": "#4b6878" } ] },
  { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [ { "color": "#334e87" } ] },
  { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [ { "color": "#023e58" } ] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#283d6a" } ] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#6f9ba5" } ] },
  { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] },
  { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [ { "color": "#023e58" } ] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#3C7680" } ] },
  { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#304a7d" } ] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#98a5be" } ] },
  { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#2c6675" } ] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#255763" } ] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#b0d5ce" } ] },
  { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [ { "color": "#023e58" } ] },
  { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [ { "color": "#98a5be" } ] },
  { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] },
  { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [ { "color": "#283d6a" } ] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [ { "color": "#3a4762" } ] },
  { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#0e1626" } ] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#4e6d70" } ] }
];

// ----- HELPERS & SMALL COMPONENTS -----
const getUvIndexCategory = (uvIndex) => { if (uvIndex <= 2) return "Low"; if (uvIndex <= 5) return "Moderate"; if (uvIndex <= 7) return "High"; if (uvIndex <= 10) return "Very High"; return "Extreme"; };
const getAqiCategory = (aqi) => { if (aqi <= 50) return { category: "Good", color: "#4ade80" }; if (aqi <= 100) return { category: "Moderate", color: "#facc15" }; if (aqi <= 150) return { category: "Sensitive", color: "#fb923c" }; if (aqi <= 200) return { category: "Unhealthy", color: "#f87171" }; if (aqi <= 300) return { category: "Very Unhealthy", color: "#c026d3" }; return { category: "Hazardous", color: "#701a75" }; };
const generateMockData = (base, variation, count) => {
  return Array.from({ length: count }, (_, i) => base + (Math.random() - 0.5) * variation * (i + 1));
};

const WeatherIcon = ({ condition, ...props }) => {
  switch ((condition || '').toLowerCase()) {
    case 'clear': return <Sun {...props} />;
    case 'clouds': return <Cloud {...props} />;
    case 'rain': case 'drizzle': return <CloudRain {...props} />;
    case 'thunderstorm': return <CloudLightning {...props} />;
    case 'snow': return <Snowflake {...props} />;
    case 'mist': case 'smoke': case 'haze': case 'dust': case 'fog': return <CloudFog {...props} />;
    default: return <SunMedium {...props} />;
  }
};

const HighlightCard = ({ title, icon, children, popupContent }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="highlight-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <div style={{ opacity: 0.95 }}>{icon}</div>}
        <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
      </div>
      <div className="card-content">{children}</div>
      {isHovered && popupContent && (
        <div className="highlight-popup">
          {popupContent}
        </div>
      )}
    </div>
  );
};

// Simple polyline area chart
const LineChart = ({ data = [], width = 100, height = 40, color = 'var(--accent-color)' }) => {
  if (!data || data.length < 2) return null;
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal === minVal ? 1 : maxVal - minVal;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - minVal) / range) * height}`).join(' ');
  const area = `0,${height} ${points} ${width},${height}`;
  const id = `g${Math.random().toString(36).slice(2, 9)}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }} aria-hidden>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <polygon fill={`url(#grad-${id})`} points={area} />
    </svg>
  );
};

const GraphPopup = ({ title, data, unit, color }) => {
  // Add a check to ensure data is not empty and the last element is a number
  const lastValue = data && data.length > 0 && typeof data[data.length - 1] === 'number'
    ? data[data.length - 1]
    : 0; // Provide a default value if data is invalid

  return (
    <div style={{ textAlign: 'center' }}>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--text-muted-color)' }}>
        {title}
      </h4>
      <LineChart data={data} width={150} height={60} color={color} />
      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
        {lastValue.toFixed(1)} {unit}
      </div>
    </div>
  );
};

const FeelsLikeEmoji = ({ value }) => {
  let emoji = '😐';
  let text = 'Feels Like';
  if (value >= 30) { emoji = '🥵'; text = 'Very Hot'; }
  else if (value >= 20) { emoji = '😊'; text = 'Pleasant'; }
  else if (value >= 10) { emoji = '🙂'; text = 'Cool'; }
  else if (value >= 0) { emoji = '🥶'; text = 'Cold'; }
  else { emoji = '🧊'; text = 'Freezing'; }
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>{emoji}</div>
      <div style={{ color: 'var(--text-muted-color)' }}>{text}</div>
    </div>
  );
};

// Circular UV gauge (simple)
const UvGauge = ({ value = 0 }) => {
  const v = Math.max(0, Math.min(12, value));
  const pct = (v / 12) * 360;
  const dash = 2 * Math.PI * 40;
  const offset = dash - (pct / 360) * dash;
  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="0 0 100 100" width="100" height="100" aria-hidden>
        <circle cx="50" cy="50" r="40" className="gauge-bg" strokeWidth="8" fill="none" stroke="#2d3748" />
        <circle cx="50" cy="50" r="40" className="gauge-fg" stroke="#facc15" strokeWidth="8" fill="none"
          strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
      </svg>
      <div className="gauge-text">
        <div className="gauge-value">{v.toFixed(1)}</div>
        <div className="gauge-label">{getUvIndexCategory(v)}</div>
      </div>
    </div>
  );
};

// AQI gauge (simple)
const AqiGauge = ({ value = 0 }) => {
  const { category, color } = getAqiCategory(value || 0);
  const pct = Math.max(0, Math.min(300, value || 0)) / 300;
  const dash = 2 * Math.PI * 40;
  const offset = dash - pct * dash;
  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="0 0 100 100" width="100" height="100" aria-hidden>
        <circle cx="50" cy="50" r="40" className="gauge-bg" strokeWidth="8" fill="none" stroke="#2d3748" />
        <circle cx="50" cy="50" r="40" className="gauge-fg" stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
      </svg>
      <div className="gauge-text">
        <div className="gauge-value">{value}</div>
        <div className="gauge-label">{category}</div>
      </div>
    </div>
  );
};

const SunriseSunset = ({ sunrise, sunset }) => (
  <div className="sunrise-sunset-container">
    <div className="sunrise-sunset-arc">
      <div className="sunrise-icon"><Sunrise size={18} /></div>
      <div className="sunset-icon"><Sunset size={18} /></div>
    </div>
    <div className="sunrise-sunset-times">
      <span>{sunrise}</span><span>{sunset}</span>
    </div>
  </div>
);

// ----- transform API data (current + forecast) -----
const transformApiData = (currentData, forecastData) => {
  const { main, weather, wind, sys, name, visibility, coord } = currentData;
  const daily = (forecastData?.list || []).filter(item => item.dt_txt?.includes("12:00:00")).map(item => ({
    day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
    date: new Date(item.dt * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
    high: Math.round(item.main.temp_max),
    low: Math.round(item.main.temp_min),
    condition: item.weather[0].main,
    trend: [item.main.temp_min, item.main.temp, item.main.temp_max]
  }));
  const hourly = (forecastData?.list || []).slice(0, 24).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    temp: Math.round(item.main.temp),
    condition: item.weather[0].main
  }));
  return {
    current: { city: name, country: sys.country, temperature: Math.round(main.temp), condition: weather[0].main, lat: coord.lat, lon: coord.lon },
    todayHighlight: {
      uvIndex: 5.5, aqi: 78, windStatus: wind.speed,
      sunrise: new Date(sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      humidity: main.humidity, visibility: (visibility / 1000).toFixed(1), feelsLike: Math.round(main.feels_like),
      windHistory: (forecastData?.list || []).slice(0, 15).map(i => i.wind.speed)
    },
    forecast: daily.slice(0, 5),
    hourly
  };
};

// ----- MAIN COMPONENT -----
function Home({ location = 'Thiruvananthapuram', onLocationChange = () => {} }) {
  const [searchTerm, setSearchTerm] = useState(location);
  const [weatherData, setWeatherData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [bgVideo, setBgVideo] = useState(backgrounds.Default);
  const [oldBgVideo, setOldBgVideo] = useState(null);
  const [showOldVideo, setShowOldVideo] = useState(false);

  // refs for map and new hourly scroller
  const [map, setMap] = useState(null);
  const [mapMarker, setMapMarker] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const hourlyScrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // fetch weather when location changes
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;
      if (!OPENWEATHER_API_KEY) {
        setError('Missing OpenWeather API key'); setLoading(false); return;
      }
      setLoading(true); setError('');
      try {
        const [currentResp, forecastResp] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`)
        ]);
        if (currentResp.status === 401 || forecastResp.status === 401) throw new Error('OpenWeather API key invalid');
        if (!currentResp.ok) throw new Error('Location not found. Check spelling.');
        const current = await currentResp.json();
        const forecast = await forecastResp.json();
        const transformed = transformApiData(current, forecast);
        setWeatherData(transformed);

        setMapMarker({
          city: `${transformed.current.city}, ${transformed.current.country}`,
          lat: transformed.current.lat,
          lng: transformed.current.lon,
          temp: transformed.current.temperature,
          condition: transformed.current.condition
        });

        if (onLocationChange) onLocationChange(location);
      } catch (err) {
        setError(err.message || 'Failed to fetch weather');
        setWeatherData(null);
        setMapMarker(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, [location, onLocationChange]);

  // visual updates after weather loaded
  useEffect(() => {
    if (!weatherData || !weatherData.current) return;
    const newBg = backgrounds[weatherData.current.condition] || backgrounds.Default;
    if (newBg !== bgVideo) {
      setOldBgVideo(bgVideo);
      setShowOldVideo(true);
      setTimeout(() => {
        setBgVideo(newBg);
        setShowOldVideo(false);
      }, 800);
    }
    if (map && weatherData.current.lat) {
      map.panTo({ lat: weatherData.current.lat, lng: weatherData.current.lon });
      if (map.getZoom && map.getZoom() < 8) map.setZoom(10);
    }
  }, [weatherData, map, bgVideo]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      onLocationChange(searchTerm);
    }
  };
  
  // Handlers for the new scroll arrows
  const startScrolling = (direction) => {
    clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = setInterval(() => {
        if (hourlyScrollRef.current) {
            hourlyScrollRef.current.scrollLeft += direction * 5; // Adjust speed here
        }
    }, 16); // Scroll every 16ms (~60fps)
  };

  const stopScrolling = () => {
      clearInterval(scrollIntervalRef.current);
  };

  const { current, todayHighlight, forecast, hourly } = weatherData || {};
  const logoSrc = mactronsLogo || 'https://i.ibb.co/gRLh9KD/mactrons.png';

  return (
    <>
      <style>{`
        :root { --card-bg-color: rgba(15, 23, 42, 0.6); --accent-color: #00D1FF; --text-color: #e2e8f0; --text-muted-color: #94a3b8; --yellow-color: #facc15; --orange-color: #fb923c;}
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; color: var(--text-color); }
        .card { position: relative; overflow: hidden; background-color: var(--card-bg-color); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.5rem; display:flex; flex-direction: column; }
        .highlight-card { position: relative; background-color: rgba(30,41,59,0.7); padding: 1rem; border-radius: 1rem; display:flex; flex-direction: column; gap: 0.5rem; }
        .highlight-popup { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); background-color: rgba(30, 41, 59, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 1rem; z-index: 10; margin-top: 1rem; white-space: nowrap; }
        .background-container { position: fixed; top:0; left:0; width:100%; height:100%; z-index:-1; background-color:#0f172a; }
        .background-video { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; transition: opacity 1s ease-in-out; }
        .background-video.fade-out { opacity:0; }
        .weather-dashboard { position: relative; z-index: 1; background-color: rgba(0,0,0,0.2); min-height:100vh; width:100%; display:flex; }
        .sidebar-nav { flex-shrink:0; background-color: var(--card-bg-color); backdrop-filter: blur(20px); border-radius: 1.5rem; display:flex; flex-direction: column; align-items: center; justify-content: space-between; margin:1rem; padding:1.5rem 1rem; z-index:20; border:1px solid rgba(255,255,255,0.1); min-width:72px; }
        .nav-list { list-style:none; padding:0; margin:0; display:flex; flex-direction: column; gap:2rem; }
        .nav-item { display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .nav-icon { color: var(--text-muted-color); transition: color .2s ease; }
        .nav-item:hover .nav-icon { color: white; }
        .main-content { flex:1; display:flex; gap:1rem; padding:1rem; align-content:flex-start; flex-wrap:wrap; }
        .main-column-left { flex: 2 1 600px; min-width:350px; display:flex; flex-direction: column; gap:1rem; }
        .main-column-right { flex: 1 1 340px; min-width:320px; display:flex; flex-direction: column; gap:1rem; }

        .card-header { font-size:1rem; font-weight:500; margin-bottom:1rem; color:var(--text-muted-color); padding:0 1.5rem; }
        .main-display { text-align:center; padding:1.5rem; }
        .temperature { font-size:5rem; font-weight:700; line-height:1; margin:1rem 0 0.5rem; }
        .condition { font-size:1.1rem; color:var(--text-muted-color); margin-top:0.5rem; }
        .main-display-footer { color:var(--text-muted-color); text-align:center; padding:1rem; display:flex; gap:6px; justify-content:center; align-items:center; }

        .search-wrapper { position:relative; width:100%; max-width:400px; margin:1rem auto 0; }
        .search-icon { position:absolute; left:21rem; top:50%; transform:translateY(-50%); color:var(--text-muted-color); z-index:2; }
        .search-input { width:100%; background-color: rgba(45,55,72,0.6); border-radius:9999px; padding:0.75rem 1rem 0.75rem 3rem; border:1px solid rgba(255,255,255,0.06); color:var(--text-color); }
        .search-input:focus { outline:none; border-color:var(--accent-color); }
        
        /* --- NEW HOURLY SCROLLER STYLES --- */
        .hourly-card { padding: 1.5rem 0; }
        .hourly-wrapper { position: relative; }
        .hourly-scroll-container {
            overflow-x: auto;
            padding: 1rem 0;
            scroll-behavior: smooth;
            /* Hide scrollbar */
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* IE and Edge */
        }
        .hourly-scroll-container::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
        }
        .scroll-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            background-color: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(5px);
            color: var(--text-color);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            opacity: 0;
            pointer-events: none;
        }
        .hourly-wrapper:hover .scroll-arrow {
            opacity: 1;
            pointer-events: auto;
        }
        .scroll-arrow:hover {
            background-color: rgba(45, 55, 72, 1);
            border-color: rgba(255, 255, 255, 0.2);
        }
        .scroll-arrow.left { left: 12px; }
        .scroll-arrow.right { right: 12px; }
        /* --- END NEW STYLES --- */

        .hourly-list { display:flex; gap:1.5rem; padding:0 2.5rem; }
        .hourly-item { display:flex; flex-direction:column; align-items:center; gap:0.5rem; }
        .hourly-time { color:var(--text-muted-color); }

        .forecast-item { display:grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; align-items:center; font-size:0.875rem; padding:0.5rem 1.5rem; }
        .highlights-content { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:1rem; padding:0 1.5rem 1.5rem; }
        .gauge-fg { transition: stroke-dashoffset 0.8s ease-out, stroke 0.8s ease-out; stroke-width:8; fill:none; }
        .gauge-bg { stroke-width:8; fill:none; stroke:#4a5568; }
        .highlight-text-center { text-align:center; }
        .highlight-value { font-size:1.875rem; font-weight:700; }

        .gauge-container { position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .gauge-svg { width:6rem; height:6rem; }
        .gauge-text { position:absolute; text-align:center; }
        .gauge-value { font-size:1.25rem; font-weight:700; }
        .gauge-label { font-size:0.75rem; color:var(--text-muted-color); }

        .sunrise-sunset-container { width:100%; display:flex; flex-direction:column; align-items:center; height:100%; }
        .sunrise-sunset-arc { position:relative; width:10rem; height:5rem; overflow:hidden; border-top:2px dashed var(--yellow-color); border-radius:5rem 5rem 0 0; }
        .sunrise-icon { position:absolute; bottom:-4px; left:-2px; color:var(--yellow-color); }
        .sunset-icon { position:absolute; bottom:-4px; right:-2px; color:var(--orange-color); }
        .sunrise-sunset-times { display:flex; justify-content:space-between; width:100%; margin-top:0.25rem; font-size:0.875rem; }

        .weather-map { flex-grow:1; position:relative; border-radius:0 0 1.5rem 1.5rem; min-height:240px; }
        .map-error { position:absolute; bottom:20px; left:50%; transform:translateX(-50%); z-index:10; background:#f87171; color:white; padding:0.5rem 1rem; border-radius:8px; font-weight:500; }

        .logo-container img { width:100px; height:100px; border-radius:8px; object-fit:cover; }

        @media (max-width:900px) {
          .weather-dashboard { flex-direction:column; padding:0; }
          .main-content { padding:1rem; }
          .sidebar-nav { order:1; flex-direction:row; width:100%; justify-content:space-around; padding:0.5rem 1rem; margin:0; border-radius:0; position:fixed; bottom:0; }
          .nav-list { flex-direction:row; gap:1.5rem; }
          .sidebar-logo, .profile-item { display:none; }
          .weather-dashboard { padding-bottom:60px; }
        }
      `}</style>

      <div className="background-container">
        {oldBgVideo && <video src={oldBgVideo} className={`background-video ${showOldVideo ? '' : 'fade-out'}`} autoPlay loop muted playsInline />}
        <video key={bgVideo} src={bgVideo} className="background-video" autoPlay loop muted playsInline />
      </div>

      <div className="weather-dashboard">
        <nav className="sidebar-nav">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <ul className="nav-list">
              <Link to="/"><li className="nav-item"><LayoutDashboard className="nav-icon" size={20} /></li></Link>
              <Link to="/map"><li className="nav-item"><Map className="nav-icon" size={20} /></li></Link>
              <Link to="/settings"><li className="nav-item"><Settings className="nav-icon" size={20} /></li></Link>
            </ul>
          </div>
          <div className="profile-item">
            <Link to="/profile"><User className="nav-icon" size={20} /></Link>
          </div>
        </nav>

        <main className="main-content">
          <div className="main-column-left">
            {loading ? (
              <div className="card" style={{ padding: 24 }}>Loading...</div>
            ) : error ? (
              <div className="card error-card"><p className="error-message">{error}</p></div>
            ) : (
              <>
                <div className="card main-display">
                  <div style={{ zIndex: 2 }}>
                    <WeatherIcon condition={current?.condition} size={80} />
                    <h1 className="temperature">{current?.temperature}°C</h1>
                    <p className="condition">{current?.condition}</p>
                    <div className="main-display-footer">
                      <span>{current?.city}, {current?.country}</span>
                      <span> | </span>
                      <span>{currentTime.split(',')[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="card hourly-card">
                  <h2 className="card-header">Hourly Forecast</h2>
                  <div className="hourly-wrapper">
                    <button className="scroll-arrow left" onMouseEnter={() => startScrolling(-1)} onMouseLeave={stopScrolling} aria-label="Scroll Left">
                      <ChevronLeft size={20} />
                    </button>
                    <div ref={hourlyScrollRef} className="hourly-scroll-container">
                      <div className="hourly-list">
                        {hourly?.map(h => <div key={h.time} className="hourly-item"><div className="hourly-time">{h.time}</div><WeatherIcon condition={h.condition} size={18} /><div>{h.temp}°</div></div>)}
                      </div>
                    </div>
                    <button className="scroll-arrow right" onMouseEnter={() => startScrolling(1)} onMouseLeave={stopScrolling} aria-label="Scroll Right">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="card forecast-card">
                  <h2 className="card-header">7-Day Forecast</h2>
                  <div className="forecast-list">
                    {forecast?.map(day => (
                      <div key={day.date} className="forecast-item">
                        <div className="forecast-details" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <WeatherIcon condition={day.condition} size={24} />
                          <span>+{day.high}° / +{day.low}°</span>
                        </div>
                        <span>{day.date}</span>
                        <span>{day.day}</span>
                        <div className="forecast-chart-container"><LineChart data={day.trend} width={80} height={30} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="main-column-right">
            {loading ? <div style={{ minHeight: 200 }} /> : error ? <div style={{height:'100%'}} /> : todayHighlight && (
              <div className="card" style={{ paddingBottom: 8 }}>
                <div className="search-wrapper" style={{ padding: '1rem 1.5rem' }}>
                  <Search className="search-icon" size={18} />
                  <input className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleSearch} placeholder="Search for a city..." />
                </div>

                <hr className="hr-divider" />

                <h2 className="card-header">Today's Highlights</h2>

                <div className="highlights-content">
                  <HighlightCard title="UV Index" icon={<Sun size={18} />}>
                    <UvGauge value={todayHighlight.uvIndex} />
                  </HighlightCard>

                  <HighlightCard title="Air Quality Index" icon={<Cloud size={18} />}>
                    <AqiGauge value={todayHighlight.aqi} />
                  </HighlightCard>

                  <HighlightCard
                    title="Wind Status"
                    icon={<Wind size={18} />}
                    popupContent={
                      <GraphPopup
                        title="Wind Speed History"
                        data={todayHighlight.windHistory || generateMockData(todayHighlight.windStatus, 0.5, 10)}
                        unit="km/h"
                        color="#00D1FF"
                      />
                    }
                  >
                    <div className="highlight-text-center">
                      <div className="highlight-value">{todayHighlight.windStatus}</div>
                      <div style={{ color: 'var(--text-muted-color)' }}>km/h</div>
                    </div>
                  </HighlightCard>

                  <HighlightCard title="Sunrise & Sunset" icon={<Sunrise size={18} />}>
                    <SunriseSunset sunrise={todayHighlight.sunrise} sunset={todayHighlight.sunset} />
                  </HighlightCard>

                  <HighlightCard
                    title="Humidity"
                    icon={<Droplet size={18} />}
                    popupContent={
                      <GraphPopup
                        title="Humidity Trend"
                        data={generateMockData(todayHighlight.humidity, 2, 10)}
                        unit="%"
                        color="#facc15"
                      />
                    }
                  >
                    <div className="highlight-text-center">
                      <div className="highlight-value">{todayHighlight.humidity}</div>
                      <div style={{ color: 'var(--text-muted-color)' }}>%</div>
                    </div>
                  </HighlightCard>

                  <HighlightCard
                    title="Visibility"
                    icon={<MapPin size={18} />}
                    popupContent={
                      <GraphPopup
                        title="Visibility Trend"
                        data={generateMockData(todayHighlight.visibility, 0.5, 10)}
                        unit="km"
                        color="#4ade80"
                      />
                    }
                  >
                    <div className="highlight-text-center">
                      <div className="highlight-value">{todayHighlight.visibility}</div>
                      <div style={{ color: 'var(--text-muted-color)' }}>km</div>
                    </div>
                  </HighlightCard>

                  <HighlightCard
                    title="Feels Like"
                    icon={<SunMedium size={18} />}
                    popupContent={<FeelsLikeEmoji value={todayHighlight.feelsLike} />}
                  >
                    <div className="highlight-text-center">
                      <div className="highlight-value">{todayHighlight.feelsLike}</div>
                      <div style={{ color: 'var(--text-muted-color)' }}>°C</div>
                    </div>
                  </HighlightCard>

                  <div className="highlight-card logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={logoSrc} alt="Mactrons Logo" style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }} />
                  </div>
                </div>

                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <div className="weather-map" style={{ marginTop: 12 }}>
                    {isLoaded ? (
                      <>
                        <div style={{ height: 280 }}>
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={{ lat: (current && current.lat) || 20, lng: (current && current.lon) || 0 }}
                            zoom={current ? 8 : 2}
                            onLoad={onMapLoad}
                            options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
                          >
                            {mapMarker && (
                              <Marker
                                position={{ lat: mapMarker.lat, lng: mapMarker.lng }}
                                onClick={() => { setInfoOpen(true); }}
                                icon={{
                                  url: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'><circle cx='28' cy='20' r='14' fill='rgba(0,209,255,0.85)' stroke='%2300D1FF' stroke-width='2'/><text x='28' y='24' fill='white' font-size='12' font-weight='600' text-anchor='middle'>${mapMarker.temp}°</text></svg>`,
                                  scaledSize: new window.google.maps.Size(56, 56),
                                }}
                              />
                            )}

                            {infoOpen && mapMarker && (
                              <InfoWindow position={{ lat: mapMarker.lat, lng: mapMarker.lng }} onCloseClick={() => setInfoOpen(false)} options={{ pixelOffset: new window.google.maps.Size(0, -30) }}>
                                <div style={{ color: 'black' }}>
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <WeatherIcon condition={mapMarker.condition} size={24} />
                                    <div>
                                      <div style={{ fontWeight: 600 }}>{mapMarker.city}</div>
                                      <div style={{ color: '#555', fontSize: 13 }}>{mapMarker.condition} • {mapMarker.temp}°C</div>
                                    </div>
                                  </div>
                                </div>
                              </InfoWindow>
                            )}
                          </GoogleMap>
                        </div>
                      </>
                    ) : <div style={{ padding: 12, color: 'var(--text-muted-color)' }}>Loading Map...</div>}
                    {error && <div className="map-error">{error}</div>}
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;