import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
    Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake,
    Search, MapPin, LayoutDashboard, Map, Settings, Bell, User, SunMedium
} from 'lucide-react';

// --- API Configuration ---
// PASTE YOUR GOOGLE MAPS API KEY HERE
const GOOGLE_MAPS_API_KEY = "AIzaSyDhGDWyAuh-cfsEvlo_79G8I_RboMGyP1M";
// PASTE YOUR OPENWEATHERMAP API KEY HERE
const OPENWEATHER_API_KEY = "4bf1e31f3791b343421a2896777a528c";


// --- BACKGROUND & STYLES ---
const backgrounds = {
    Cloudy: 'https://cdn.discordapp.com/attachments/1252909180790968413/1255866778172559421/cloudy.mp4?ex=667eb59c&is=667d641c&hm=a62a9aa7c88b77d6de76793a628532f62788f28c2670e9c85b1a32a677e48b94&',
};
const mapStyles = [ { "elementType": "geometry", "stylers": [ { "color": "#1d2c4d" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#8ec3b9" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#1a3646" } ] }, { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [ { "color": "#4b6878" } ] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [ { "color": "#64779e" } ] }, { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [ { "color": "#4b6878" } ] }, { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [ { "color": "#334e87" } ] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [ { "color": "#023e58" } ] }, { "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#283d6a" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#6f9ba5" } ] }, { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] }, { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [ { "color": "#023e58" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#3C7680" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#304a7d" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#98a5be" } ] }, { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#2c6675" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#255763" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#b0d5ce" } ] }, { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [ { "color": "#023e58" } ] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [ { "color": "#98a5be" } ] }, { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [ { "color": "#1d2c4d" } ] }, { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [ { "color": "#283d6a" } ] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [ { "color": "#3a4762" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#0e1626" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#4e6d70" } ] } ];

const WeatherIcon = ({ condition, ...props }) => {
    switch (condition) {
        case "Clear": return <Sun {...props} />; case "Clouds": return <Cloud {...props} />; case "Rain": case "Drizzle": return <CloudRain {...props} />; case "Thunderstorm": return <CloudLightning {...props} />; case "Snow": return <Snowflake {...props} />; case "Mist": case "Smoke": case "Haze": case "Dust": case "Fog": case "Sand": case "Ash": case "Squall": case "Tornado": return <CloudFog {...props} />; default: return <SunMedium {...props} />;
    }
};

const NavItem = ({ icon, label }) => ( <li className="nav-item"><div className="nav-icon">{icon}</div><span className="nav-label">{label}</span></li> );

function MapPage({ location, onLocationChange }) {
    const [map, setMap] = useState(null);
    const [searchTerm, setSearchTerm] = useState(location);
    const [markers, setMarkers] = useState([]);
    const [activeMarker, setActiveMarker] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const fetchWeatherForCity = useCallback(async (city, mapInstance, setView = false) => {
        if (OPENWEATHER_API_KEY === "YOUR_OPENWEATHERMAP_API_KEY_HERE") {
            setError("Please add your OpenWeatherMap API key.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Step 1: Geocode city to get lat/lon
            const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`);
            if (geoResponse.status === 401) {
                throw new Error("Authentication failed. Check your OpenWeatherMap API key.");
            }
            const geoData = await geoResponse.json();
            
            if (!geoData || !Array.isArray(geoData) || geoData.length === 0) {
                throw new Error(`Could not find location: "${city}". Please check the spelling.`);
            }
            
            const { lat, lon, name, country } = geoData[0];

            // Step 2: Get weather for the coordinates
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
            if (!weatherResponse.ok) {
                throw new Error("Could not fetch weather data for the location.");
            }
            const weatherData = await weatherResponse.json();
            
            const newMarker = {
                city: `${name}, ${country}`,
                lat,
                lng: lon,
                temp: Math.round(weatherData.main.temp),
                condition: weatherData.weather[0].main
            };

            setMarkers(prevMarkers => {
                if (prevMarkers.some(m => m.city === newMarker.city)) return prevMarkers;
                return [...prevMarkers, newMarker];
            });
            setActiveMarker(newMarker.city);

            if (setView && mapInstance) {
                mapInstance.panTo({ lat, lng: lon });
                mapInstance.setZoom(10);
            }
            
            if (city !== location) {
                onLocationChange(city);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [location, onLocationChange]);

    const onMapLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
        fetchWeatherForCity(location, mapInstance, true);
    }, [fetchWeatherForCity, location]);


    const handleSearch = (e) => {
        if (e.key === 'Enter' && map) {
            fetchWeatherForCity(searchTerm, map, true);
        }
    };

    return (
        <>
            <style>{`
                :root { --card-bg-color: rgba(15, 23, 42, 0.7); --accent-color: #00D1FF; --text-color: #e2e8f0; --text-muted-color: #94a3b8;}
                .background-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background-color: #0f172a; }
                .background-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
                .weather-dashboard { position: relative; z-index: 1; background-color: rgba(0,0,0,0.2); min-height: 100vh; width: 100%; color: var(--text-color); font-family: 'Inter', sans-serif; display: flex; box-sizing: border-box; }
                .sidebar-nav { flex-shrink: 0; background-color: var(--card-bg-color); backdrop-filter: blur(20px); border-radius: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: space-between; margin: 1rem; padding: 1.5rem 1rem; z-index: 20; border: 1px solid rgba(255, 255, 255, 0.1); }
                .sidebar-nav a { text-decoration: none; color: inherit; }
                .nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2rem; }
                .nav-item { position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .nav-icon { color: var(--text-muted-color); transition: all 0.3s ease; }
                .nav-item:hover .nav-icon { color: white; }
                
                .map-content-wrapper { flex: 1; padding: 1rem; display: flex; }
                .map-container { flex-grow: 1; border-radius: 1.5rem; overflow: hidden; position: relative; }
                .map-search-wrapper { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10; width: 100%; max-width: 400px; }
                .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted-color); }
                .search-input { width: 100%; background-color: rgba(45,55,72,0.8); backdrop-filter: blur(10px); border-radius: 9999px; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid rgba(255,255,255,0.1); color: var(--text-color); box-sizing: border-box; transition: border-color 0.3s ease; }
                .search-input:focus { outline: none; border-color: var(--accent-color); }
                .gm-style .gm-style-iw-c { background-color: rgba(30, 41, 59, 0.9) !important; color: var(--text-color) !important; border-radius: 12px !important; padding: 12px !important; }
                .gm-style .gm-style-iw-t::after { background: rgba(30, 41, 59, 0.9) !important; }
                .map-error { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10; background-color: #f87171; color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 500; }
            `}</style>

            <div className="background-container">
                <video key={backgrounds.Cloudy} src={backgrounds.Cloudy} className="background-video" autoPlay loop muted playsInline />
            </div>
            
            <div className="weather-dashboard">
                <main className="map-content-wrapper">
                    <div className="map-container">
                        {isLoaded ? (
                            <>
                                <div className="map-search-wrapper">
                                    <Search className="search-icon" size={20} />
                                    <input 
                                        type="text" 
                                        placeholder="Search for a city..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleSearch}
                                        className="search-input"
                                    />
                                </div>
                                {error && <div className="map-error">{error}</div>}
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '100%' }}
                                    center={{ lat: 20, lng: 0 }}
                                    zoom={2}
                                    onLoad={onMapLoad}
                                    options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
                                >
                                    {markers.map((marker) => (
                                        <Marker
                                            key={marker.city}
                                            position={{ lat: marker.lat, lng: marker.lng }}
                                            onClick={() => setActiveMarker(marker.city)}
                                            icon={{
                                                url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="rgba(0, 209, 255, 0.8)" stroke="%2300D1FF" stroke-width="2"/><text x="24" y="28" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${marker.temp}°</text></svg>`,
                                                scaledSize: new window.google.maps.Size(48, 48),
                                            }}
                                        />
                                    ))}

                                    {activeMarker && markers.find(m => m.city === activeMarker) && (
                                        <InfoWindow
                                            position={{ lat: markers.find(m => m.city === activeMarker).lat, lng: markers.find(m => m.city === activeMarker).lng }}
                                            onCloseClick={() => setActiveMarker(null)}
                                            options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                                        >
                                            <div style={{ backgroundColor: 'transparent', color: 'var(--text-color)', padding: '0', borderRadius: '8px' }}>
                                                <h4 style={{ margin: 0, fontWeight: '600' }}>{activeMarker}</h4>
                                                <p style={{ margin: '4px 0 0' }}>{markers.find(m => m.city === activeMarker).condition}</p>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            </>
                        ) : <div>Loading Map...</div>}
                    </div>
                </main>
            </div>
        </>
    );
}

export default MapPage;

