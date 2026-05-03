import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLargeScreen: window.innerWidth > 1024,
};

const windowScreen = createSlice({
    name: "windowScreen",
    initialState,
    reducers: {
        setIsLargeScreen: (state, action) => {
            state.isLargeScreen = action.payload;
        },
    },
});

export const { setIsLargeScreen } = windowScreen.actions;
export default windowScreen.reducer;
