// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || "";

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const handleSuccess = async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`;
        const response = await axios.get(reverseGeoUrl);
        if (response.data.length > 0) {
          setLocation(response.data[0].name);
        } else {
          setError('Could not determine city from coordinates.');
        }
      } catch (err) {
        setError('Failed to fetch city name.');
      }
    };

    const handleError = (err) => {
      setError(`Geolocation error: ${err.message}`);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []);

  return { location, error };
};

export default useGeolocation;