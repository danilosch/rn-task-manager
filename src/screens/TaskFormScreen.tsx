import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

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

const TaskFormScreen: React.FC<TaskFormScreenProps> = ({
  taskId,
  onSubmitSuccess,
}) => {
  const { tasks, users, addTask, updateTask } = useTasksStore();
  const taskToEdit = tasks.find((t) => t.id === taskId);

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
    <View style={styles.container}>
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
            autoFocus
          />
        )}
      />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
      
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
    </View>
  );
};

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

export default TaskFormScreen;
