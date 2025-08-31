import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import TaskListScreen from "../screens/TaskListScreen";
import TaskFormScreen from "../screens/TaskFormScreen";

export type RootStackParamList = {
  TaskList: undefined;
  TaskForm: { taskId?: string; onSubmitSuccess: () => void } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={{
          headerStyle: { backgroundColor: "#00465c" },
          headerTintColor: "#73fb9a",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{ title: "Tarefas" }}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={{ title: "Nova Tarefa" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
