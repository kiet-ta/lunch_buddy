// app/(tabs)/scan-qr.tsx (or wherever you want to put it)
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import client from "../../src/api/client";

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

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

    // 1. Validate Scheme: Check if it starts with lunchbuddy://
    if (!data.startsWith("lunchbuddy://")) {
      Alert.alert("Invalid QR", "This is not a Lunch Buddy code.");
      return;
    }

    // 2. Parse URL to get token
    try {
      // Use expo-linking to parse the URL
      const parsed = Linking.parse(data);
      const token = parsed.queryParams?.token;

      if (!token) {
        Alert.alert("Error", "Invalid invite link.");
        return;
      }

      // 3. Call Backend API to join
      await joinGroup(token as string);
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
