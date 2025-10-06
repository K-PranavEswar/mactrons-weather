import React from 'react';

const ForecastCard = ({ data }) => (
    <div className="weather-card forecast">
        <div className="card-header">
            <h3>2-Day Forecast</h3>
            <p>{data.location}</p>
        </div>
        <div className="forecast-days">
            {data.forecasts.map(day => (
                <div className="day-row" key={day.date}>
                    <img src={day.icon} alt={day.condition} className="weather-icon-small" />
                    <span className="day-name">{day.day}</span>
                    <span className="day-temp">{day.low}° / {day.high}°</span>
                </div>
            ))}
        </div>
    </div>
);

export default ForecastCard;