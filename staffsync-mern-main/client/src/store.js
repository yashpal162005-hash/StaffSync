import { configureStore, createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: JSON.parse(localStorage.getItem("staffsync_user") || "null") },
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user;
      localStorage.setItem("staffsync_token", action.payload.token);
      localStorage.setItem("staffsync_user", JSON.stringify(action.payload.user));
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem("staffsync_user", JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem("staffsync_token");
      localStorage.removeItem("staffsync_user");
    }
  }
});

export const { setAuth, setUser, logout } = authSlice.actions;
export const store = configureStore({ reducer: { auth: authSlice.reducer } });
