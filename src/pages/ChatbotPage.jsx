import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../GeminiChatbot.css';

// --- Import your new card components (create these files) ---
import CurrentWeatherCard from '../cards/CurrentWeatherCard';
import ForecastCard from '../cards/ForecastCard';
import StadiumQueryCard from '../cards/StadiumQueryCard';
import SuggestionChips from '../cards/SuggestionChips';
import LoadingIndicator from '../cards/LoadingIndicator';

// --- Icon components (or use an icon library like react-icons) ---
const GeminiIcon = () => <div className="gemini-icon">✨</div>;
const UserIcon = () => <div className="user-icon">👤</div>;
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
);

const ChatbotPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('Mumbai'); // State to track location
    const chatEndRef = useRef(null);

    // Helper to scroll to the latest message
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Add a message to the chat state
    const addMessage = useCallback((sender, type, data, suggestions = []) => {
        setMessages(prev => [...prev, { id: Date.now(), sender, type, data, suggestions }]);
    }, []);
    
    // Initial greeting message
    useEffect(() => {
        if (messages.length === 0) {
            addMessage(
                'bot', 
                'text', 
                { text: "Hello! I'm your weather assistant. Ask me for the weather in any city in India." },
                ["Weather in Delhi", "Forecast for Bangalore"]
            );
        }
    }, [messages.length, addMessage]);

    // --- LIVE API LOGIC ---

    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

    // Helper to find a location in the user's message
    const parseLocation = (message) => {
        const match = message.match(/in\s+([A-Za-z\s]+)/i) || message.match(/for\s+([A-Za-z\s]+)/i);
        if (match && match[1]) {
            const newLocation = match[1].trim();
            setCurrentLocation(newLocation); // Update state with new location
            return newLocation;
        }
        return currentLocation; // Use the last known location if none is found
    };

    // Helper to process the 5-day/3-hour forecast data into a simple 2-day forecast
    const processForecastData = (forecastList) => {
        const dailyData = {};
        
        // Filter for forecasts that are not for the current date
        forecastList.filter(item => {
            const itemDate = new Date(item.dt * 1000).toLocaleDateString();
            const todayDate = new Date().toLocaleDateString();
            return itemDate !== todayDate;
        }).forEach(item => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    temps: [],
                    conditions: [],
                    icons: [],
                };
            }
            dailyData[date].temps.push(item.main.temp);
            // We capture the condition around midday for a representative daily value
            if (new Date(item.dt * 1000).getHours() >= 12) {
                dailyData[date].conditions.push(item.weather[0].main);
                dailyData[date].icons.push(item.weather[0].icon);
            }
        });
    
        const nextTwoDays = Object.keys(dailyData).slice(0, 2);
        return nextTwoDays.map((date, index) => {
            const dayInfo = dailyData[date];
            const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            return {
                day: index === 0 ? 'Tomorrow' : dayOfWeek,
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                high: Math.round(Math.max(...dayInfo.temps)),
                low: Math.round(Math.min(...dayInfo.temps)),
                condition: dayInfo.conditions[0] || 'N/A',
                // OpenWeatherMap icons can be used with a URL like: `https://openweathermap.org/img/wn/10d@2x.png`
                icon: dayInfo.icons[0] ? `https://openweathermap.org/img/wn/${dayInfo.icons[0]}.png` : '⛅'
            };
        });
    };
    

    const getBotResponse = async (message) => {
        const lowerCaseMessage = message.toLowerCase();
        const location = parseLocation(lowerCaseMessage);

        try {
            if (lowerCaseMessage.includes("weather") || lowerCaseMessage.includes("current")) {
                const response = await fetch(`${API_BASE_URL}/weather?q=${location}&appid=${API_KEY}&units=metric`);
                if (!response.ok) throw new Error(`City not found or API error.`);
                const data = await response.json();
                
                return {
                    type: 'currentWeather',
                    data: {
                        location: `${data.name}, ${data.sys.country}`,
                        temperature: Math.round(data.main.temp),
                        condition: data.weather[0].main,
                        feelsLike: Math.round(data.main.feels_like),
                        humidity: data.main.humidity,
                        wind: (data.wind.speed * 3.6).toFixed(1) + ' km/h' // m/s to km/h
                    },
                    suggestions: [`Forecast for ${data.name}`, `Stadiums in ${data.name}`]
                };
            }

            if (lowerCaseMessage.includes("forecast")) {
                const response = await fetch(`${API_BASE_URL}/forecast?q=${location}&appid=${API_KEY}&units=metric`);
                if (!response.ok) throw new Error(`City not found or API error.`);
                const data = await response.json();

                return {
                    type: 'dailyForecast',
                    data: {
                        location: `${data.city.name}, ${data.city.country}`,
                        forecasts: processForecastData(data.list)
                    },
                    suggestions: [`Weather in ${data.city.name}`]
                };
            }
            
            // Stadium logic remains mocked for now, as there's no direct API for it
            if (lowerCaseMessage.includes("stadium")) {
                return {
                    type: 'stadiumQuery',
                    data: {
                        responseText: `Here is an example for a stadium in ${location}. Weather data for specific venues is not available via this API.`,
                        exampleCard: {
                            stadiumName: 'Example Stadium',
                            location: location,
                            temperature: 'N/A', condition: 'N/A',
                            pitchCondition: 'Unknown',
                            impact: 'Weather impact cannot be determined.'
                        }
                    },
                    suggestions: [`Weather in ${location}`]
                };
            }

            return {
                type: 'text',
                data: { text: "I'm not sure how to answer that. You can ask me for the current weather or a 2-day forecast for any city." },
                suggestions: [`Weather in ${currentLocation}`]
            };

        } catch (error) {
            return {
                type: 'error',
                data: { text: `Sorry, I couldn't find the weather for "${location}". Please check the spelling or try another city.` },
            };
        }
    };


    const handleSendMessage = useCallback(async (messageText) => {
        const trimmedMessage = messageText.trim();
        if (!trimmedMessage) return;

        addMessage('user', 'text', { text: trimmedMessage });
        setInputMessage('');
        setIsLoading(true);

        const botResponse = await getBotResponse(trimmedMessage);
        addMessage('bot', botResponse.type, botResponse.data, botResponse.suggestions);

        setIsLoading(false);
    }, [addMessage, getBotResponse]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputMessage);
        }
    };
    
    // Renders the correct component based on message type
    const renderMessageContent = (msg) => {
        switch (msg.type) {
            case 'text':
                return <p>{msg.data.text}</p>;
            case 'currentWeather':
                return <CurrentWeatherCard data={msg.data} />;
            case 'dailyForecast':
                return <ForecastCard data={msg.data} />;
            case 'stadiumQuery':
                return <StadiumQueryCard data={msg.data} />;
            case 'error':
                 return <p className="error-message">{msg.data.text}</p>;
            default:
                return null;
        }
    };

    return (
        <div className="chat-page">
            <div className="chat-header-gemini">
                <GeminiIcon />
                <h3>Weather</h3>
            </div>

            <div className="chat-messages-container">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-row ${msg.sender}`}>
                        <div className="avatar-icon">
                            {msg.sender === 'user' ? <UserIcon /> : <GeminiIcon />}
                        </div>
                        <div className="message-content-wrapper">
                            {renderMessageContent(msg)}
                            {msg.sender === 'bot' && msg.suggestions?.length > 0 && (
                                <SuggestionChips 
                                    suggestions={msg.suggestions} 
                                    onSuggestionClick={handleSendMessage} 
                                />
                            )}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="message-row bot">
                       <div className="avatar-icon"><GeminiIcon /></div>
                       <LoadingIndicator />
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="input-wrapper">
                    <input
                        type="text"
                        className="chat-input-gemini"
                        placeholder="Ask for weather in any city..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                </div>
                 <button 
                    className="send-btn-gemini" 
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isLoading}
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    );
};

export default ChatbotPage;