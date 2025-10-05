import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ChatbotPage.css'; // Now using the dark theme styles

// Utility function to generate a unique session ID
const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9);
};

const ChatbotPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const chatMessagesRef = useRef(null);

    // 1. Stabilize addMessage using useCallback
    const addMessage = useCallback((text, sender, options = null, suggestions = null) => {
        setMessages(prevMessages => [...prevMessages, {
            id: Date.now(),
            text,
            sender,
            options,
            suggestions
        }]);
    }, [setMessages]); // setMessages is a stable setter

    // 2. Stabilize restartChat using useCallback
    const restartChat = useCallback(() => {
        // Clear session and messages
        setSessionId(generateSessionId());
        setMessages([]); 

        // Show restart message
        setTimeout(() => {
            addMessage("Chat restarted! 🔄 Type 'hi' to start planning a new event.", 'bot', ['👋 Hi']);
        }, 300);
    }, [addMessage, setSessionId, setMessages]); // Dependencies

    // 3. Stabilize sendMessage using useCallback (depends on restartChat and addMessage)
    const sendMessage = useCallback(async (message) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        // Check for restart commands
        const restartCommands = ['exit', 'end', 'restart', 'start over', 'reset'];
        if (restartCommands.some(cmd => trimmedMessage.toLowerCase() === cmd)) {
            // Add user's restart command message before restarting
            addMessage(trimmedMessage, 'user');
            setInputMessage('');
            restartChat();
            return;
        }

        // Add user message to chat and clear input
        addMessage(trimmedMessage, 'user');
        setInputMessage('');

        // Show typing indicator
        setIsTyping(true);

        // Send to backend
        try {
            const response = await fetch('/api/chat/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: trimmedMessage,
                    session_id: sessionId,
                })
            });

            const data = await response.json();
            
            if (data.session_id && sessionId === null) {
                setSessionId(data.session_id);
            }

            // Hide typing indicator
            setIsTyping(false);

            // Add bot response
            setTimeout(() => {
                addMessage(data.message, 'bot', data.options, data.event_suggestions);
            }, 500);

        } catch (error) {
            setIsTyping(false);
            addMessage('Sorry, something went wrong. Please try again.', 'bot');
            console.error('Error:', error);
        }
    }, [sessionId, addMessage, restartChat, setInputMessage, setIsTyping, setSessionId]); 

    // Focus input and scroll to bottom on component load
    useEffect(() => {
        if (!sessionId) {
            setSessionId(generateSessionId());
        }

        // Add initial welcome message
        addMessage('Hello! 👋 I\'m your event planning assistant. I\'ll help you find the perfect time and place for your event based on weather predictions.<br/><br/>Type <strong>"hi"</strong> to get started!', 'bot', ['hi']);
    }, [addMessage, sessionId, setSessionId]); 

    // Scroll to bottom whenever messages change or typing status changes
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages, isTyping]);


    const handleSendClick = () => {
        sendMessage(inputMessage);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendClick();
        }
    };

    const handleOptionClick = (option) => {
        sendMessage(option);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="bot-avatar-container">
                    <div className="bot-avatar">🤖</div>
                </div>
                <h1>🌤️ ParadeWatch</h1>
                <p>Your Weather-Smart Event Planning Assistant</p>
            </div>

            <div className="chat-messages" id="chatMessages" ref={chatMessagesRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <div className={`avatar ${msg.sender}-msg-avatar`}>{msg.sender === 'user' ? '👤' : '🤖'}</div>
                        
                        <div className="message-wrapper">
                            <div className="message-name">{msg.sender === 'user' ? 'You' : 'AI Assistant'}</div>
                            
                            <div 
                              className="message-content" 
                              dangerouslySetInnerHTML={{ __html: msg.text }} 
                            />
                            
                            {msg.options && msg.options.length > 0 && (
                                <div className="options-container">
                                    {msg.options.map((option, optIndex) => (
                                        <button 
                                            key={optIndex} 
                                            className="option-btn" 
                                            onClick={() => handleOptionClick(option)}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {msg.suggestions && (
                                <div className="event-suggestion">
                                    <h3>📅 Event Details</h3>
                                    <p><strong>Date:</strong> {msg.suggestions.best_date}</p>
                                    <p><strong>Time:</strong> {msg.suggestions.best_time}</p>
                                    <p><strong>Weather:</strong> {msg.suggestions.weather_description}</p>
                                    <p><strong>Rain Chance:</strong> {msg.suggestions.rain_probability}%</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message bot" id="typingIndicator">
                        <div className="avatar bot-msg-avatar">🤖</div>
                        <div className="message-wrapper">
                            <div className="message-name">AI Assistant</div>
                            <div className="typing-indicator active">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="chat-input-container">
                <input 
                    type="text" 
                    className="chat-input" 
                    id="chatInput" 
                    placeholder="Type your message..."
                    autoComplete="off"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping}
                />
                <button 
                    className="send-btn" 
                    id="sendBtn"
                    onClick={handleSendClick}
                    disabled={!inputMessage.trim() || isTyping}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatbotPage;
