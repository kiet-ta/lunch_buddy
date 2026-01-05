import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import client from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_guest?: boolean;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    loginGuest: () => Promise<void>;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true, // default load to check token

    loginGuest: async () => {
        try {
            // Call the new backend endpoint
            // Gọi endpoint backend mới
            const res = await client.post("/auth/login/guest");
            const token = res.data.access_token;

            await SecureStore.setItemAsync("access_token", token);

            // Fetch user info immediately to update state
            // Lấy thông tin người dùng ngay lập tức để cập nhật trạng thái
            const userRes = await client.get("/auth/me");
            set({ user: userRes.data, isLoading: false });
        } catch (error) {
            console.log("Guest login failed", error);
            set({ user: null, isLoading: false });
        }
    },
    login: async (token: string) => {
        try {
            await SecureStore.setItemAsync("access_token", token);
            // after save token, call API /me to get info
            const res = await client.get("/auth/me");
            set({ user: res.data, isLoading: false });
        } catch (error) {
            console.log("Login failed", error);
            await SecureStore.deleteItemAsync("access_token");
            set({ user: null, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        await SecureStore.deleteItemAsync("access_token");
        await AsyncStorage.removeItem("pending_invite_token");
        delete client.defaults.headers.common["Authorization"];

        set({ user: null, isLoading: false });
    },

    checkAuth: async () => {
        try {
            const token = await SecureStore.getItemAsync("access_token");
            if (token) {
                const res = await client.get("/auth/me");
                set({ user: res.data });
            } else {
                console.log("No token found, attempting guest login...");
                await get().loginGuest();
            }
        } catch (error) {
            console.log("Check auth failed", error);
            await SecureStore.deleteItemAsync("access_token");
            console.log("Attempting guest login after auth failure...");
            await get().loginGuest();
        } finally {
            set({ isLoading: false });
        }
    },
}));
