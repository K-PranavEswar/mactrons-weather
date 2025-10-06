// src/components/DetailsPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeather, toggleUnits } from '../features/weather/weatherSlice';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake, Wind, Droplet, Thermometer, Sunrise, Sunset } from 'lucide-react';

const WeatherIcon = ({ condition, ...props }) => { /* ... same as HeroSection ... */ };
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
const mapStyles = [ /* ... paste your full mapStyles array here ... */ ];

const DetailsPanel = () => {
    const dispatch = useDispatch();
    const { data, units } = useSelector((state) => state.weather);
    const [searchTerm, setSearchTerm] = useState('');
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (data && !mapInstanceRef.current && window.google) {
            initializeMap(data.lat, data.lon);
        } else if (data && mapInstanceRef.current) {
            mapInstanceRef.current.panTo({ lat: data.lat, lng: data.lon });
        }
    }, [data]);

    const initializeMap = (lat, lon) => {
        if (mapContainerRef.current) {
            mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
                center: { lat, lng: lon }, zoom: 10, styles: mapStyles, disableDefaultUI: true
            });
        }
    };
    
    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm) {
            dispatch(fetchWeather(searchTerm));
            setSearchTerm('');
        }
    };
    
    if (!data) return <aside className="details-panel"></aside>;

    const unitSymbol = units === 'metric' ? '°C' : '°F';

    return (
        <aside className="details-panel">
            <div className="panel-controls">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search another location..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                />
                <button onClick={() => dispatch(toggleUnits())} className="unit-toggle">
                    {unitSymbol}
                </button>
            </div>
            <section>
                <h3 className="section-title">HOURLY FORECAST</h3>
                <div className="hourly-list">
                    {data.hourly.map(h => (
                        <div key={h.time} className="hourly-item">
                            <span className="hourly-time">{h.time}</span>
                            <WeatherIcon condition={h.condition} size={28} />
                            <span className="hourly-temp">{units === 'metric' ? h.temp_c : h.temp_f}°</span>
                        </div>
                    ))}
                </div>
            </section>
            <hr className="section-divider" />
            <section>
                <h3 className="section-title">TODAY'S HIGHLIGHTS</h3>
                <div className="highlights-grid">
                    <div className="highlight-item">
                        <span className="highlight-label"><Wind size={16}/> Wind</span>
                        <span className="highlight-value">{units === 'metric' ? `${data.highlights.wind_kph.toFixed(1)} km/h` : `${data.highlights.wind_mph.toFixed(1)} mph`}</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-label"><Droplet size={16}/> Humidity</span>
                        <span className="highlight-value">{data.highlights.humidity} %</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-label"><Thermometer size={16}/> Feels Like</span>
                        <span className="highlight-value">{units === 'metric' ? data.highlights.feelsLike_c : data.highlights.feelsLike_f}°</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-label"><Sunrise size={16}/> Sunrise</span>
                        <span className="highlight-value">{new Date(data.highlights.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-label"><Sunset size={16}/> Sunset</span>
                        <span className="highlight-value">{new Date(data.highlights.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                </div>
            </section>
            <hr className="section-divider" />
            <section>
                 <h3 className="section-title">LOCATION</h3>
                 <div ref={mapContainerRef} className="map-container"></div>
            </section>
        </aside>
    );
};

export default DetailsPanel;