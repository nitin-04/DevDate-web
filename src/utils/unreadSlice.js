import { createSlice } from "@reduxjs/toolkit";

const unreadSlice = createSlice({
  name: "unread",
  initialState: 0,
  reducers: {
    setUnreadCount: (state, action) => action.payload,
    incrementUnreadCount: (state) => state + 1,
    decrementUnreadCount: (state, action) => Math.max(0, state - (action.payload || 1)),
    clearUnreadCount: () => 0,
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  clearUnreadCount,
} = unreadSlice.actions;

export default unreadSlice.reducer;
