import React from 'react';

const CurrentWeatherCard = ({ data }) => {
    // A real app would use an icon mapping
    const weatherIcon = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
    }[data.condition] || '🌡️';

    return (
        <div className="weather-card current">
            <div className="card-header">
                <h3>{data.location}</h3>
                <p>Current Weather</p>
            </div>
            <div className="card-body">
                <div className="main-temp">
                    <span className="icon">{weatherIcon}</span>
                    <span className="temp">{data.temperature}°C</span>
                </div>
                <div className="condition">{data.condition}</div>
            </div>
            <div className="card-footer">
                <span>Feels like: {data.feelsLike}°</span>
                <span>Humidity: {data.humidity}%</span>
                <span>Wind: {data.wind}</span>
            </div>
        </div>
    );
};

export default CurrentWeatherCard;