import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import {useAuthStore} from './src/stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout () {
  const {user, isLoading, checkAuth} = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

// check auth when app start
useEffect(() => {
  checkAuth();
}, []);

// protect route: if not login back to sign-in
useEffect(() => {
    if (isLoading) return;
  
    const inAuthGroup = segments[0] === '(auth)';
  
    if  (!user && !inAuthGroup) {
      // not login but in page -> back to login
      router.replace('/auth/sign-in')
    } else if (user && inAuthGroup) {
      // logined but still in login page -> come to homepage
      router.replace('/(tabs)')
    }
}, [user, isLoading, segments])
    
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}> 
        <ActivityIndicator size="large" />    
      </View>
    )
  }
  return <Slot/>;
}
