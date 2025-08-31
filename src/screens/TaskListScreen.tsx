import React, { useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTasksStore } from "../store/tasksStore";
import { Task } from "../types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskList">;

export default function TaskListScreen() {
  const { tasks, fetchTasks, fetchUsers } = useTasksStore();
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>Status: {item.status ? "Concluída" : "Pendente"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hStack}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("TaskForm")}
        >
          <Text style={styles.addButtonText}>+ Nova Tarefa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("TaskForm")}
        >
          <Text style={styles.addButtonText}>+ Filtros</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
  hStack: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  taskItem: {
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
  },
  title: { fontSize: 16, fontWeight: "bold" },
  addButton: {
    flex: 1,
    backgroundColor: "#00465c",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
