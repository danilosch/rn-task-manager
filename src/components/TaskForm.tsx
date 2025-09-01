import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import CustomButton from "./CustomButton";
import UserSelect from "./UserSelect";
import { useTasksStore } from "../store/tasksStore";

const taskSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  userId: z.string().min(1, "Selecione um responsável"),
  status: z.boolean(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

type TaskFormProps = {
  taskId?: string;
  onSubmit: (data: TaskFormData) => void;
  onDelete?: () => void;
};

export default function TaskForm({
  taskId,
  onSubmit,
  onDelete,
}: TaskFormProps) {
  const { tasks, users } = useTasksStore();
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
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: "#ccc", true: "#00465c" }}
              />
              <Text style={{ marginLeft: 8 }}>
                {value ? "Concluída" : "Pendente"}
              </Text>
            </View>
          )}
        />

        <View style={styles.footer}>
          <CustomButton
            icon={<Feather name="save" size={18} color="#fff" />}
            title={taskToEdit ? "Salvar" : "Adicionar"}
            accessibilityLabel="Salvar Tarefa"
            onPress={handleSubmit(onSubmit)}
          />
          {taskToEdit && (
            <CustomButton
              variant="secondary"
              icon={<Feather name="trash" size={18} color="#00465c" />}
              title="Excluir"
              accessibilityLabel="Excluir Tarefa"
              onPress={onDelete ?? (() => {})}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  error: {
    color: "red",
    marginBottom: 8,
  },
  footer: {
    gap: 8,
    marginVertical: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  label: { fontWeight: "bold", marginBottom: 4 },
});
