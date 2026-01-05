import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // 1. Check auth khi app start
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Logic bảo vệ route (Navigation Guard)
  useEffect(() => {
    if (isLoading) return;

    // Lấy tên group hiện tại (ví dụ: (auth) hoặc (tabs))
    const inAuthGroup = segments[0] === "(auth)";

    // Debug: In ra để xem app đang hiểu mình đứng ở đâu
    console.log("Current user:", user ? "Logged In" : "Guest");
    console.log("Current segment:", segments);

    if (!user && !inAuthGroup) {
      // Chưa login và không ở trang auth -> Đá về sign-in
      // QUAN TRỌNG: Expo Router tự động bỏ qua tên group (auth) trong URL
      // Dùng replace để người dùng không bấm Back quay lại được
      router.replace("/sign-in");
    } else if (user && inAuthGroup) {
      // Đã login mà vẫn lảng vảng ở trang auth -> Đá vào trong
      // Giả sử bạn đã có file app/(tabs)/index.tsx hoặc app/home.tsx
      // Nếu chưa có (tabs), hãy trỏ tạm về '/' để test
      router.replace("/");
    }
  }, [user, isLoading, segments]);

  // 3. Màn hình chờ (Splash logic)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
