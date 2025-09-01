import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import TaskFiltersModal from "../components/TaskFiltersModal";
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

  const [filtersVisible, setFiltersVisible] = useState(false);

  const navigation = useNavigation<NavigationProp>();
  const route =
    useRoute<RouteProp<Record<string, TaskListScreenParams>, string>>();

  useEffect(() => {
    fetchUsers();
    fetchTasks(); // carrega 1ª página (reset)
  }, [fetchTasks, fetchUsers]);

  useEffect(() => {
    if (route.params?.refresh) {
      fetchTasks();
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh, fetchTasks, navigation]);

  return (
    <View style={styles.container}>
      <TaskHeaderActions onOpenFilters={() => setFiltersVisible(true)} />
      <TaskFlatList />
      <TaskFiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f2f2f2", flex: 1, padding: 16 },
});
