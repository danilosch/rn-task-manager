import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import NetInfo from "@react-native-community/netinfo";

import TaskForm, { TaskFormData } from "../components/TaskForm";
import { RootStackParamList } from "../navigation";
import { useTasksStore } from "../store/tasksStore";

type TaskFormRouteProp = RouteProp<RootStackParamList, "TaskForm">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskForm">;

export default function TaskFormScreen() {
  const route = useRoute<TaskFormRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { taskId } = route.params || {};
  const { tasks, addTask, updateTask, deleteTask } = useTasksStore();
  const taskToEdit = tasks.find((t) => t.id === taskId);

  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (data: TaskFormData) => {
    try {
      if (taskToEdit) {
        await updateTask({ ...taskToEdit, ...data });
      } else {
        await addTask(data);
      }

      if (offline) {
        Alert.alert(
          "Offline",
          "Alteração salva localmente e será sincronizada quando online."
        );
      }

      navigation.navigate("TaskList", { refresh: true });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a tarefa.");
    }
  };

  const handleDelete = async () => {
    if (!taskToEdit) return;

    try {
      await deleteTask(taskToEdit.id);
      if (offline) {
        Alert.alert(
          "Offline",
          "Exclusão realizada localmente e será sincronizada quando online."
        );
      }
      navigation.navigate("TaskList", { refresh: true });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir a tarefa.");
    }
  };

  return (
    <TaskForm taskId={taskId} onSubmit={handleSubmit} onDelete={handleDelete} />
  );
}
