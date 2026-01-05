import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { groupService, Group } from "../../src/services/groupService";
import { Ionicons } from "@expo/vector-icons";

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const router = useRouter();

  // Load groups
  const fetchGroups = async () => {
    try {
      const data = await groupService.getMyGroups();
      setGroups(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    try {
      await groupService.createGroup(newGroupName, "No desc");
      setModalVisible(false);
      setNewGroupName("");
      fetchGroups(); // Reload list
    } catch (error) {
      Alert.alert("Error", "Could not create group");
    }
  };

  return (
    <View style={styles.container}>
      {/* List Groups */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/group/${item.id}` as any)} // Navigate to detail
          >
            <View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc}>ID: {item.id}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        )}
      />

      {/* FAB Button to Create */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Simple Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Lunch Group</Text>
            <TextInput
              placeholder="Group Name (e.g., Pizza Lovers)"
              style={styles.input}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateGroup}>
                <Text style={{ color: "blue" }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  cardDesc: { color: "#666" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e91e63",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
});
