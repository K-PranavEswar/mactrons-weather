import React from 'react';

const StadiumQueryCard = ({ data }) => (
    <div className="stadium-card">
        <p>{data.responseText}</p>
        <div className="example-card">
            <h4>Example: {data.exampleCard.stadiumName}</h4>
            <p><strong>Location:</strong> {data.exampleCard.location}</p>
            <p><strong>Weather:</strong> {data.exampleCard.temperature}°C, {data.exampleCard.condition}</p>
            <p><strong>Pitch Condition:</strong> {data.exampleCard.pitchCondition}</p>
            <p><strong>Impact:</strong> {data.exampleCard.impact}</p>
        </div>
    </div>
);

export default StadiumQueryCard;