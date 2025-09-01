import React, { useEffect } from "react";
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
import CustomButton from "../components/CustomButton";

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

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      <View style={styles.hStack}>
        <CustomButton
          variant="primary"
          icon={<Feather name="plus" size={18} color="#fff" />}
          title="Nova Tarefa"
          accessibilityLabel="Adicionar nova tarefa"
          onPress={() => navigation.navigate("TaskForm")}
        />
        <CustomButton
          variant="secondary"
          icon={<Feather name="filter" size={18} color="#00465c" />}
          title="Filtros"
          accessibilityLabel="Abrir filtros"
          onPress={() => {}}
        />
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
