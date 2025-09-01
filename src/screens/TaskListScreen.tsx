import React, { useEffect, useCallback } from "react";
import {
  Dimensions,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
} from "react-native";
import { useTasksStore } from "../store/tasksStore";
import { Task } from "../types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation";
import { Feather } from "@expo/vector-icons";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskList">;

type TaskListScreenParams = {
  refresh?: boolean;
};

const screenHeight = Dimensions.get("window").height;

export default function TaskListScreen() {
  const {
    users,
    fetchTasks,
    fetchMoreTasks,
    fetchUsers,
    getFilteredTasks,
    toggleTaskStatus,
    loading,
    hasMore,
  } = useTasksStore();

  const navigation = useNavigation<NavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, TaskListScreenParams>, string>>();

  useEffect(() => {
    fetchUsers();
    fetchTasks(); // carrega 1ª página (reset)
  }, []);

  useEffect(() => {
    if (route.params?.refresh) {
      fetchTasks();
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  const renderItem = ({ item }: { item: Task }) => {
    const user = users.find((u) => u.id === item.assigneeId);
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

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      <View style={styles.hStack}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("TaskForm")}
          accessibilityLabel="Adicionar nova tarefa"
        >
          <Text style={styles.primaryButtonText}>+ Nova Tarefa</Text>
        </TouchableOpacity>

        {/* Placeholder para filtros (Bottom Sheet será feito no passo 6) */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            // TODO: abrir bottom sheet de filtros
          }}
          accessibilityLabel="Abrir filtros"
        >
          <Feather name="filter" size={18} color="#00465c" />
          <Text style={styles.secondaryButtonText}>Filtros</Text>
        </TouchableOpacity>
      </View>

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
          if (
            contentHeight < screenHeight &&
            useTasksStore.getState().hasMore
          ) {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
  hStack: { flexDirection: "row", gap: 8, marginBottom: 16 },
  primaryButton: {
    flex: 1,
    backgroundColor: "#00465c",
    padding: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e6f2f6",
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryButtonText: { color: "#00465c", fontWeight: "600" },

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
  avatar: { width: 16, height: 16, borderRadius: 14, marginRight: 8 },
  iconBtn: { padding: 6 },
  footer: { paddingVertical: 16 },
  empty: { paddingTop: 48, alignItems: "center" },
  emptyText: { color: "#666" },
});
