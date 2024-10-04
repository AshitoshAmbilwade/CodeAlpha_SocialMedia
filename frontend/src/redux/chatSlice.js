import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [], // Ensure this is initialized as an empty array
    },
    reducers: {
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload; // This should replace the entire messages array
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload); // Use this to add a single message
        }
    }
});

export const { setOnlineUsers, setMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
