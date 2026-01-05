import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { groupService } from "../../../src/services/groupService";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Gọi API lấy link invite
  const handleGenerateInvite = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await groupService.getInviteLink(Number(id));
      setInviteUrl(data.invite_url);
    } catch (error) {
      Alert.alert("Error", "Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (inviteUrl) {
      await Clipboard.setStringAsync(inviteUrl);
      Alert.alert("Copied!", "Link copied to clipboard");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Group ID: {id}</Text>

      <View style={styles.inviteSection}>
        <Text style={styles.subHeader}>Invite Members</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#e91e63" />
        ) : inviteUrl ? (
          <View style={styles.qrContainer}>
            {/* QR CODE DISPLAY */}
            <QRCode value={inviteUrl} size={200} />

            <Text style={styles.linkText}>{inviteUrl}</Text>

            <TouchableOpacity
              style={styles.btnOutline}
              onPress={copyToClipboard}
            >
              <Text style={styles.btnOutlineText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleGenerateInvite}
          >
            <Text style={styles.btnText}>Generate Invite QR</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  inviteSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
  },
  qrContainer: { alignItems: "center", gap: 16 },
  linkText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginVertical: 10,
  },
  btnPrimary: {
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  btnText: { color: "white", fontWeight: "bold" },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#e91e63",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnOutlineText: { color: "#e91e63" },
});
