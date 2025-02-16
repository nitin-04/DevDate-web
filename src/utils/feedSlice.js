import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: null,
    reducers: {
        addfeed: (state, action) => {
            return action.payload;
        },
        removeFeed: (state, action) => null,
    },

});

export const { addfeed } = feedSlice.actions;
export default feedSlice.reducer;