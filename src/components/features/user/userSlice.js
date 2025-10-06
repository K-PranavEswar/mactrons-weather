import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userName: 'Alex Mercer',
  userPhoto: 'https://cdn.discordapp.com/attachments/1252909180790968413/1256247963383038084/default-avatar.png?ex=66800720&is=667eb5a0&hm=08412a3271295e8656e185b3068f05e2630a91617013b19124430e38a4d257b8&',
  savedLocations: ['Thiruvananthapuram', 'Mumbai', 'London'],
  // We can also move the main location state here
  currentLocation: 'Thiruvananthapuram', 
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName(state, action) {
      state.userName = action.payload;
    },
    setUserPhoto(state, action) {
      state.userPhoto = action.payload;
    },
    addSavedLocation(state, action) {
      if (!state.savedLocations.includes(action.payload)) {
        state.savedLocations.push(action.payload);
      }
    },
    removeSavedLocation(state, action) {
      state.savedLocations = state.savedLocations.filter(
        (location) => location !== action.payload
      );
    },
    setCurrentLocation(state, action) {
      state.currentLocation = action.payload;
    },
  },
});

export const {
  setUserName,
  setUserPhoto,
  addSavedLocation,
  removeSavedLocation,
  setCurrentLocation,
} = userSlice.actions;

export default userSlice.reducer;