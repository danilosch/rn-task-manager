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
  assignee: { alignItems: "center", flexDirection: "row", marginTop: 4 },
  avatar: { borderRadius: 14, height: 20, marginRight: 8, width: 20 },
  colLeft: { flex: 1, paddingRight: 8 },
  colRight: { alignItems: "center", flexDirection: "row", gap: 8 },
  empty: { alignItems: "center", paddingTop: 48 },
  emptyText: { color: "#666" },
  footer: { paddingVertical: 16 },
  iconBtn: { padding: 6 },
  row: { alignItems: "center", flexDirection: "row" },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  title: { color: "#1a1a1a", fontSize: 16, fontWeight: "bold" },
});
