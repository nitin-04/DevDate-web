import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: null,
    reducers: {
        addfeed: (state, action) => {
            return action.payload;
        },
        removeUserFromFeed: (state, action) => {
            const newFeed = state ? state.filter((user) => user._id !== action.payload) : null;
            return newFeed;
        },
        clearFeed: () => null,
    },
});

export const { addfeed, removeUserFromFeed, clearFeed } = feedSlice.actions;
export default feedSlice.reducer;