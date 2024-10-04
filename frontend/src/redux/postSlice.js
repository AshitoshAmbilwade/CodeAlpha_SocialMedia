import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [],
        selectedPost: null,
    },
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        },
        // Add this reducer
        updatePostBookmarks: (state, action) => {
            const { postId, bookmarks } = action.payload;
            const postIndex = state.posts.findIndex(post => post._id === postId);
            if (postIndex !== -1) {
                state.posts[postIndex].bookmarks = bookmarks;
            }
        }
    }
});

export const { setPosts, setSelectedPost, updatePostBookmarks } = postSlice.actions;
export default postSlice.reducer;
