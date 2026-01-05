import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useAuthStore } from "../../src/stores/authStore";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          // No need for router.replace('/sign-in') here
          // because _layout.tsx will automatically catch the user = null event and redirect to the next page.
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>
          Xin chào, {user?.first_name || "Bạn"}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  userInfo: { marginBottom: 40, alignItems: "center" },
  username: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  email: { fontSize: 16, color: "#666" },
  logoutBtn: {
    backgroundColor: "#ff4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
