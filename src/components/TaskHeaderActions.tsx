import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation";
import CustomButton from "./CustomButton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskList">;

export default function TaskHeaderActions() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.headerActions}>
      <CustomButton
        variant="primary"
        icon={<Feather name="plus" size={18} color="#fff" />}
        title="Nova Tarefa"
        accessibilityLabel="Adicionar nova tarefa"
        onPress={() => navigation.navigate("TaskForm")}
      />
      <CustomButton
        variant="secondary"
        icon={<Feather name="filter" size={18} color="#00465c" />}
        title="Filtros"
        accessibilityLabel="Abrir filtros"
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: "row", gap: 8, marginBottom: 16 },
});
