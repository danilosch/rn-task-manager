import React, { useCallback } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useTasksStore } from "../store/tasksStore";
import CustomButton from "./CustomButton";
import CustomModal from "./CustomModal";

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
    <CustomModal visible={visible} onClose={onClose}>
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
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 16,
  },
  row: { flexDirection: "row", gap: 8, marginVertical: 8 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 12 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  userChip: {
    borderColor: "#00465c",
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  userChipSelected: { backgroundColor: "#00465c" },
});
