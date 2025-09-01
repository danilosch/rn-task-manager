import React, { useCallback } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useTasksStore } from "../store/tasksStore";
import CustomButton from "./CustomButton";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TaskFiltersModal({ visible, onClose }: Props) {
  const { users, filters, setFilters } = useTasksStore();

  const toggleStatus = useCallback(
    (status: boolean | null) => {
      setFilters({ ...filters, status });
    },
    [filters, setFilters]
  );

  const toggleUser = useCallback(
    (userId: string) => {
      const exists = filters.userIds.includes(userId);
      const updated = exists
        ? filters.userIds.filter((id) => id !== userId)
        : [...filters.userIds, userId];
      setFilters({ ...filters, userIds: updated });
    },
    [filters, setFilters]
  );

  const resetFilters = useCallback(() => {
    setFilters({ status: null, userIds: [] });
  }, [setFilters]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Filtros</Text>

          {/* Status */}
          <Text style={styles.subtitle}>Status</Text>
          <View style={styles.row}>
            <CustomButton
              variant={filters.status === null ? "primary" : "secondary"}
              title="Todos"
              accessibilityLabel="Ver todas as tarefas"
              onPress={() => toggleStatus(null)}
            />
            <CustomButton
              variant={filters.status === false ? "primary" : "secondary"}
              title="Pendentes"
              accessibilityLabel="Ver tarefas pendentes"
              onPress={() => toggleStatus(false)}
            />
            <CustomButton
              variant={filters.status === true ? "primary" : "secondary"}
              title="Concluídas"
              accessibilityLabel="Ver tarefas concluídas"
              onPress={() => toggleStatus(true)}
            />
          </View>

          {/* Responsáveis */}
          <Text style={styles.subtitle}>Responsáveis</Text>
          <FlatList
            data={users}
            keyExtractor={(u) => u.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = filters.userIds.includes(item.id);
              return (
                <Pressable
                  onPress={() => toggleUser(item.id)}
                  style={[styles.userChip, selected && styles.userChipSelected]}
                >
                  <Text style={{ color: selected ? "#fff" : "#00465c" }}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          <View style={styles.actions}>
            <CustomButton
              variant="secondary"
              title="Limpar filtros"
              accessibilityLabel="Limpar filtros"
              onPress={resetFilters}
            />
            <CustomButton
              variant="primary"
              title="Fechar"
              accessibilityLabel="Fechar Filtros"
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  row: { flexDirection: "row", gap: 8, marginVertical: 8 },
  userChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#00465c",
    borderRadius: 16,
    marginRight: 8,
  },
  userChipSelected: { backgroundColor: "#00465c" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 8,
  },
});
