// src/features/weather/weatherSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || "";

// Async thunk to fetch all weather data
export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  async (location, { rejectWithValue }) => {
    try {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      const geoResponse = await axios.get(geoUrl);
      if (geoResponse.data.length === 0) {
        return rejectWithValue('City not found. Please check the spelling.');
      }
      const { lat, lon } = geoResponse.data[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl),
      ]);
      
      return transformApiData(weatherResponse.data, forecastResponse.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch weather data.');
    }
  }
);

const initialState = {
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  units: 'metric', // 'metric' (Celsius) or 'imperial' (Fahrenheit)
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    toggleUnits(state) {
      state.units = state.units === 'metric' ? 'imperial' : 'metric';
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Helper function to transform API data into a clean format
const transformApiData = (current, forecast) => {
  const { main, weather, wind, sys, name, coord } = current;
  
  const hourly = forecast.list.slice(0, 7).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temp_c: Math.round(item.main.temp),
      temp_f: Math.round(item.main.temp * 9/5 + 32),
      condition: item.weather[0].main
  }));

  return {
    city: name,
    country: sys.country,
    lat: coord.lat,
    lon: coord.lon,
    currentTime: Date.now(),
    current: {
      temp_c: Math.round(main.temp),
      temp_f: Math.round(main.temp * 9/5 + 32),
      condition: weather[0].main,
      conditionDesc: weather[0].description,
    },
    highlights: {
      wind_kph: wind.speed * 3.6, // m/s to km/h
      wind_mph: wind.speed * 2.237,
      humidity: main.humidity,
      feelsLike_c: Math.round(main.feels_like),
      feelsLike_f: Math.round(main.feels_like * 9/5 + 32),
      sunrise: sys.sunrise * 1000,
      sunset: sys.sunset * 1000,
    },
    hourly,
  };
};

export const { toggleUnits } = weatherSlice.actions;

export default weatherSlice.reducer;