// app/(tabs)/scan-qr.tsx (or wherever you want to put it)
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import client from "../../src/api/client";
import { useAuthStore } from "../../src/stores/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_INVITE_KEY = "pending_invite_token";

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getPermissions();
  }, []);

  // Handle barcode scanned event
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    if (!data.startsWith("lunchbuddy://")) {
      Alert.alert("Invalid QR", "This is not a Lunch Buddy code.");
      return;
    }

    try {
      const parsed = Linking.parse(data);
      const token = parsed.queryParams?.token as string;

      if (!token) {
        Alert.alert("Error", "Invalid invite link.");
        return;
      }

      if (user?.is_guest) {
        Alert.alert(
          "Yêu cầu tài khoản",
          "Bạn đang dùng chế độ Khách. Vui lòng đăng ký tài khoản để tham gia nhóm!",
          [
            {
              text: "Đăng ký ngay",
              onPress: async () => {
                await AsyncStorage.setItem(PENDING_INVITE_KEY, token);
                router.push("/sign-up");
              },
            },
            {
              text: "Hủy",
              style: "cancel",
              onPress: () => setScanned(false),
            },
          ],
        );
        return;
      }

      await joinGroup(token);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not process the link.");
    }
  };
  const joinGroup = async (token: string) => {
    try {
      // Call the join-by-token endpoint
      await client.post("/groups/join-by-token", { token });

      Alert.alert("Success", "You have joined the group!", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Failed",
        error.response?.data?.detail || "Something went wrong",
      );
      setScanned(false); // Allow scanning again if failed
    }
  };

  if (hasPermission === null) return <Text>Requesting camera permission</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
