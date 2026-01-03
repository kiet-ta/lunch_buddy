import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';
import { PromiseTask } from 'react-native/types_generated/index';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState> ((set) => (
    {
        user: null,
        isLoading: true, // default load to check token

        login: async (token: string) => {
            await SecureStore.setItemAsync('access_token', token);
            // after save token, call API /me to get info 
            try {
                const res = await client.get('/auth/me');
                set ({user: res.data, isLoading: false})
            } catch (error)
            {
                console.log('Login fetch user failed', error)
            }
        },

        logout : async () => {
            await SecureStore.deleteItemAsync('access_token')
            set({user: null, isLoading: false})
        },

        checkAuth: async () => {
            try {
                const token = await SecureStore.getItemAsync('access_token');
                if (token) {
                    const res = await client.get('/auth/me');
                    set ({user: res.data})
                }
            } catch (error) {
                console.log('Check auth failed', error)
                await SecureStore.deleteItemAsync('access_token')
            } finally {
                set ({ isLoading: false })
            }
        }
    }
))
