import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation";
import { useTasksStore } from "../store/tasksStore";
import { Task } from "../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskList">;

const screenHeight = Dimensions.get("window").height;

export default function TaskFlatList() {
  const navigation = useNavigation<NavigationProp>();

  const {
    fetchMoreTasks,
    fetchTasks,
    getFilteredTasks,
    hasMore,
    loading,
    toggleTaskStatus,
    users,
  } = useTasksStore();

  const filteredTasks = getFilteredTasks();

  const renderItem = ({ item }: { item: Task }) => {
    const user = users.find((u) => u.id === item.userId);
    return (
      <Pressable
        onPress={() =>
          navigation.navigate("TaskForm", {
            taskId: item.id,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Editar tarefa ${item.title}`}
        style={styles.taskItem}
      >
        <View style={styles.row}>
          <View style={styles.colLeft}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {user && (
              <View style={styles.assignee}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <Text>{user.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.colRight}>
            <TouchableOpacity
              onPress={() => toggleTaskStatus(item.id)}
              accessibilityLabel={
                item.status ? "Marcar como pendente" : "Marcar como concluída"
              }
              style={styles.iconBtn}
            >
              <Feather
                name={item.status ? "check-square" : "square"}
                size={22}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={filteredTasks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 100 }}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (hasMore && !loading) fetchMoreTasks();
      }}
      onContentSizeChange={(_, contentHeight) => {
        if (contentHeight < screenHeight && useTasksStore.getState().hasMore) {
          fetchMoreTasks();
        }
      }}
      refreshControl={
        <RefreshControl
          refreshing={loading && !hasMore}
          onRefresh={fetchTasks}
        />
      }
      ListFooterComponent={
        loading ? (
          <View style={styles.footer}>
            <ActivityIndicator />
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  taskItem: {
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
  },
  row: { flexDirection: "row", alignItems: "center" },
  colLeft: { flex: 1, paddingRight: 8 },
  colRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "bold", color: "#1a1a1a" },
  assignee: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  avatar: { width: 20, height: 20, borderRadius: 14, marginRight: 8 },
  iconBtn: { padding: 6 },
  footer: { paddingVertical: 16 },
  empty: { paddingTop: 48, alignItems: "center" },
  emptyText: { color: "#666" },
});
