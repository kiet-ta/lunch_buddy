import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#e91e63" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "My Groups",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      {/* Hides the detail screen from the tab bar, only showing it when navigated to */}
      <Tabs.Screen
        name="group/[id]"
        options={{
          href: null,
          title: "Group Detail",
        }}
      />
    </Tabs>
  );
}
