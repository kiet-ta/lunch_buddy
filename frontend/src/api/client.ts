import axios from "axios";
import * as SecurityStore from "expo-secure-store";

const client = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor 1: sent request -> auto set token in header
client.interceptors.request.use(async (config) => {
    const token = await SecurityStore.getItemAsync("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor 2: response -> log response errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("API Error:", error.response.data);
            // TODO: Handle 401 Unauthorized (Logout user)
        } else {
            console.error("Network Error:", error.message);
        }
        return Promise.reject(error);
    },
);

export default client;
