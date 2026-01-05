import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../src/stores/authStore";
import { View, ActivityIndicator } from "react-native";
import * as Linking from "expo-linking";
import { groupService } from "../src/services/groupService";

export default function RootLayout() {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  //Auth state manager at Domain / State layer
  //Decision: "Who is this user? Is this user logged in?"
  useEffect(() => {
    checkAuth();
  }, []);

  // Handling Deep Links
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      let data = Linking.parse(event.url);

      // Check if the path is for joining a group
      // URL format: lunchbuddy://group/join?token=xyz
      if (data.path === "group/join" && data.queryParams?.token) {
        const token = data.queryParams.token;
        console.log("Detected Invite Token:", token);

        // Navigate to a dedicated Join Screen or call API directly
        // Recommendation: Navigate to a generic loading screen that calls the API
        router.push({
          pathname: "/(auth)/join-process", // You need to create this route
          params: { token: token },
        });
      }
    };

    // 1. Listen for incoming links while app is running
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // 2. Check if app was opened by a link (Cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      let data = Linking.parse(event.url);

      // Check link: lunchbuddy://group/join?token=...
      if (data.path === "group/join" && data.queryParams?.token) {
        const token = data.queryParams.token as string;

        if (!user) {
          // TODO: Tricky case: User is not logged in yet.
          // Temporary solution: Redirect to login, store the token in a global store.
          // After login, check the store and join the group.
          alert("Please login to join the group");
          router.replace("/sign-in");
          return;
        }

        try {
          // User is already authenticated -> Join immediately
          await groupService.joinByToken(token);
          alert("Joined group successfully! 🎉");
          // Reload or redirect to group list
          router.replace("/(tabs)");
        } catch (e) {
          alert("Failed to join group via link.");
        }
      }
    };

    // Listen for deep link events
    const sub = Linking.addEventListener("url", handleDeepLink);

    // Handle cold start (app was closed when the link was opened)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();
  }, [user]); // Re-run when user state changes

  // Routing guard in UI / Navigation layer
  // Decision: "Should this user be allowed to appear on this screen?"
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    console.log("Current user:", user ? "Logged In" : "Guest");
    console.log("Current segment:", segments);

    if (!user && !inAuthGroup) {
      router.replace("/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
