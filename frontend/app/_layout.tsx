import { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { View, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { groupService } from "../src/services/groupService";

// Key used to store invite token when the user is NOT logged in yet
// Deferred Action Pattern
// Deferred the action join for process later when conditions are met.
// impove UX
const PENDING_INVITE_KEY = "pending_invite_token";

export default function RootLayout() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // State to temporarily disable Auth Guard while processing a deep link
  // (prevents redirect conflicts)
  const [isProcessingLink, setIsProcessingLink] = useState(false);

  // 1. Initialize authentication state on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Handle join-group logic (extracted for reuse)
  const handleJoinGroup = async (token: string) => {
    setIsProcessingLink(true);
    try {
      // Could be replaced by navigation to a dedicated loading screen
      await groupService.joinByToken(token);
      alert("Đã tham gia nhóm thành công! 🎉");
      router.replace("/(tabs)");

      // Clean up stored token if it exists
      await AsyncStorage.removeItem(PENDING_INVITE_KEY);
    } catch (e) {
      alert("Link mời không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsProcessingLink(false);
    }
  };

  // 3. Unified deep link handler (single source of truth)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const parsed = Linking.parse(event.url);

      if (parsed.path === "group/join" && parsed.queryParams?.token) {
        const token = parsed.queryParams.token as string;
        console.log("🚀 Detected Invite Token:", token);

        if (isLoading) return; // Wait until auth check finishes

        if (!user) {
          // CASE: User is not logged in → store token for later use
          console.log("User not logged in. Saving token...");
          await AsyncStorage.setItem(PENDING_INVITE_KEY, token);
          alert("Vui lòng đăng nhập để tham gia nhóm.");
          router.replace("/sign-in");
        } else {
          // CASE: User already logged in → process immediately
          await handleJoinGroup(token);
        }
      }
    };

    // Listen for deep link events while app is running
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle cold start (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [user, isLoading]);

  // 4. Deferred action: process stored invite token after login
  useEffect(() => {
    const checkPendingInvite = async () => {
      if (user && !isLoading) {
        const pendingToken = await AsyncStorage.getItem(PENDING_INVITE_KEY);
        if (pendingToken) {
          console.log(
            "Found pending invite token, processing deferred join...",
          );
          await handleJoinGroup(pendingToken);
        }
      }
    };

    checkPendingInvite();
  }, [user, isLoading]);

  // 5. Auth Guard (routing logic)
  useEffect(() => {
    if (isLoading || isProcessingLink) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (user && inAuthGroup) {
      // Redirect to tabs ONLY if there is no pending invite
      // (avoids conflict with deferred join logic)
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, isProcessingLink]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
