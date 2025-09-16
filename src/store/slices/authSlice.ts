import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: {
    id: number;
    name_en: string;
    name_ar: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("authState");
      }
    },
    setUser: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
    },
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("authToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const userString = localStorage.getItem("user");

        if (token && userString) {
          try {
            const user = JSON.parse(userString);
            state.token = token;
            state.refreshToken = refreshToken;
            state.user = user;
            state.isAuthenticated = true;
          } catch (error) {
            console.error("Error parsing stored user data:", error);
            // Clear invalid data
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
          }
        }
      }
    },
  },
});

export const { logout, setUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
