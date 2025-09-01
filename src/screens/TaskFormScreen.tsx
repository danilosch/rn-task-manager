import React from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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

  const handleSubmit = async (data: TaskFormData) => {
    if (taskToEdit) {
      await updateTask({ ...taskToEdit, ...data });
    } else {
      await addTask(data);
    }
    navigation.navigate("TaskList", { refresh: true });
  };

  const handleDelete = () => {
    if (!taskToEdit) return;
    deleteTask(taskToEdit!.id);
    navigation.navigate("TaskList", { refresh: true });
  };

  return <TaskForm taskId={taskId} onSubmit={handleSubmit} onDelete={handleDelete} />;
}
