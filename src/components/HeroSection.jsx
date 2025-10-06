// src/components/HeroSection.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake } from 'lucide-react';

const WeatherIcon = ({ condition, ...props }) => {
    switch ((condition || '').toLowerCase()) {
        case 'clear': return <Sun {...props} />; case 'clouds': return <Cloud {...props} />;
        case 'rain': case 'drizzle': return <CloudRain {...props} />;
        case 'thunderstorm': return <CloudLightning {...props} />; case 'snow': return <Snowflake {...props} />;
        default: return <CloudFog {...props} />;
    }
};

const HeroSection = () => {
    const { data, units } = useSelector((state) => state.weather);
    const [dateTime, setDateTime] = useState({ date: '', time: '' });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setDateTime({
                date: now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
                time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!data) return <div className="hero-section"></div>; // Render empty while loading to prevent errors

    const temp = units === 'metric' ? data.current.temp_c : data.current.temp_f;
    const unitSymbol = units === 'metric' ? '°C' : '°F';
    
    return (
        <main className="hero-section">
            <div className="hero-temp">{temp}{unitSymbol}</div>
            <div className="hero-condition">
                <WeatherIcon condition={data.current.condition} size={48} />
                <span>{data.current.conditionDesc}</span>
            </div>
            <div>
                <div className="hero-location">{data.city}, {data.country}</div>
                <div className="hero-date-time">{dateTime.time} - {dateTime.date}</div>
            </div>
        </main>
    );
};

export default HeroSection;