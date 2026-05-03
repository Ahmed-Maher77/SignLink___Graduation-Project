import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	isAuth: false,
	userData: {
		username: "",
		email: "",
		image: "",
		userId: "",
	},
};

const apiSlice = createSlice({
	name: "api",
	initialState,
	reducers: {
		setIsAuth: (state, action) => {
			state.isAuth = action.payload;
		},
		setUserData: (state, action) => {
			const { username, email, image, userId } = action.payload;
			state.userData = { username, email, image, userId };
		},
	},
});

export const { setIsAuth, setUserData } = apiSlice.actions;
export default apiSlice.reducer;
