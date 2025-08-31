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
  Text,
  TextInput,
} from "react-native";
import { z } from "zod";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../navigation";

import { useTasksStore } from "../store/tasksStore";

const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  assigneeId: z.string().min(1, "Selecione um responsável"),
  status: z.boolean(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormScreenProps {
  taskId?: string;
  onSubmitSuccess?: () => void;
}

type TaskFormRouteProp = RouteProp<RootStackParamList, "TaskForm">;

export default function TaskFormScreen() {
  const route = useRoute<TaskFormRouteProp>();
  const { taskId, onSubmitSuccess } = route.params || {};
  const { tasks, users, addTask, updateTask } = useTasksStore();
  const taskToEdit = tasks.find((t) => t.id === taskId);

  console.log("Task ID:", taskId);
  console.log("Task to edit:", taskToEdit);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: taskToEdit?.title || "",
      assigneeId: taskToEdit?.assigneeId || "",
      status: taskToEdit?.status || false,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    if (taskToEdit) {
      await updateTask({ ...taskToEdit, ...data });
    } else {
      await addTask(data);
    }
    onSubmitSuccess?.();
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
        <Text>Título</Text>
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

        <Text>Responsável</Text>
        <Controller
          control={control}
          name="assigneeId"
          render={({ field: { onChange, value } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label="Selecione..." value="" />
              {users.map((user) => (
                <Picker.Item key={user.id} label={user.name} value={user.id} />
              ))}
            </Picker>
          )}
        />
        {errors.assigneeId && (
          <Text style={styles.error}>{errors.assigneeId.message}</Text>
        )}

        <Text>Status</Text>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange}>
              <Picker.Item label="PENDENTE" value={false} />
              <Picker.Item label="CONCLUÍDA" value={true} />
            </Picker>
          )}
        />
        <Button
          title={taskToEdit ? "Salvar" : "Adicionar"}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  picker: {
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
});
