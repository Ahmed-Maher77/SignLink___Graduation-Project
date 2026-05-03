import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import webrtcReducer from "./webrtcSlice";
import apiReducer from "./apiSlice";
import windowScreenReducer from "./windowScreen";

// Configure persist for api reducer
const apiPersistConfig = {
	key: "api",
	storage,
	whitelist: ["isAuth", "userData"], // Only persist these fields
};

const persistedApiReducer = persistReducer(apiPersistConfig, apiReducer);

export const store = configureStore({
	reducer: {
		webrtc: webrtcReducer,
		api: persistedApiReducer,
		windowScreen: windowScreenReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
			},
		}),
});

export const persistor = persistStore(store);
