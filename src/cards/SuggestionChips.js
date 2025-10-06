import React from 'react';

const SuggestionChips = ({ suggestions, onSuggestionClick }) => (
    <div className="suggestion-chips-container">
        {suggestions.map((text, index) => (
            <button key={index} className="chip" onClick={() => onSuggestionClick(text)}>
                {text}
            </button>
        ))}
    </div>
);

export default SuggestionChips;