import { configureStore } from "@reduxjs/toolkit";
import canvasSlice from "./slices/toolsSlice";

const store = configureStore({
  reducer: {
    canvasSlice,
  },
});

export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
