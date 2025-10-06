import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from '../features/weather/weatherSlice';
import userReducer from '../features/user/userSlice'; // Import the new user reducer

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    user: userReducer, // Add it to the store
  },
});