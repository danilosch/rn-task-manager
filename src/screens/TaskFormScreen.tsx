import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation";

import { useTasksStore } from "../store/tasksStore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import UserSelect from "../components/UserSelect";

const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  userId: z.string().min(1, "Selecione um responsável"),
  status: z.boolean(),
});

type TaskFormData = z.infer<typeof taskSchema>;

type TaskFormRouteProp = RouteProp<RootStackParamList, "TaskForm">;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskForm">;

export default function TaskFormScreen() {
  const route = useRoute<TaskFormRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { taskId } = route.params || {};
  const { tasks, users, addTask, updateTask, deleteTask } = useTasksStore();
  const taskToEdit = tasks.find((t) => t.id === taskId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: taskToEdit?.title || "",
      userId: taskToEdit?.userId || "",
      status: taskToEdit?.status || false,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    if (taskToEdit) {
      await updateTask({ ...taskToEdit, ...data });
    } else {
      await addTask(data);
    }
    navigation.navigate("TaskList", { refresh: true });
  };

  const handleDeleteTask = () => {
    if (!taskToEdit) return;
    deleteTask(taskToEdit!.id);
    navigation.navigate("TaskList", { refresh: true });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80} // ajuste se o header sobrepor
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Título</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Título da tarefa"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.error}>{errors.title.message}</Text>
        )}

        <Text style={styles.label}>Responsável</Text>
        <Controller
          control={control}
          name="userId"
          render={({ field: { onChange, value } }) => (
            <UserSelect users={users} value={value} onChange={onChange} />
          )}
        />
        {errors.userId && (
          <Text style={styles.error}>{errors.userId.message}</Text>
        )}

        <Text style={styles.label}>Status</Text>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
              }}
            >
              <Switch value={value} onValueChange={onChange} />
              <Text style={{ marginLeft: 8 }}>
                {value ? "Concluída" : "Pendente"}
              </Text>
            </View>
          )}
        />

        <View style={styles.footer}>
          <Button
            title={taskToEdit ? "Salvar" : "Adicionar"}
            onPress={handleSubmit(onSubmit)}
          />
          {taskToEdit && (
            <Button title="Excluir" color="gray" onPress={handleDeleteTask} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: "bold", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  footer: {
    marginVertical: 16,
    gap: 8,
  },
});
