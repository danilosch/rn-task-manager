import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import TaskFlatList from "../components/TaskFlatList";
import TaskHeaderActions from "../components/TaskHeaderActions";
import { RootStackParamList } from "../navigation";
import { useTasksStore } from "../store/tasksStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskList">;

type TaskListScreenParams = {
  refresh?: boolean;
};

export default function TaskListScreen() {
  const { fetchTasks, fetchUsers } = useTasksStore();

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

  return (
    <View style={styles.container}>
      <TaskHeaderActions />
      <TaskFlatList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
});
