import { create } from "zustand";
import axios from "../services/api";
import { Task, User } from "../types";

type TasksFilter = {
  userIds: string[];
  status: boolean | null;
};

type TasksStore = {
  tasks: Task[];
  users: User[];
  filters: TasksFilter;
  setTasks: (tasks: Task[]) => void;
  setUsers: (users: User[]) => void;
  setFilters: (filters: TasksFilter) => void;

  fetchUsers: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  filteredTasks: Task[];
};

export const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: [],
  users: [],
  filters: { userIds: [], status: null },

  setTasks: (tasks) => set({ tasks }),
  setUsers: (users) => set({ users }),
  setFilters: (filters) => set({ filters }),

  fetchUsers: async () => {
    try {
      const { data: users } = await axios.get<User[]>("/users", {
        params: {
          _sort: "name",
          _order: "asc",
        },
      });
      set({ users });
    } catch (error) {
      console.error("Erro ao buscar users:", error);
    }
  },

  fetchTasks: async () => {
    try {
      const { data: tasks } = await axios.get<Task[]>("/tasks", {
        params: {
          _sort: "createdAt",
          _order: "desc",
        },
      });
      set({ tasks });
    } catch (error) {
      console.error("Erro ao buscar tasks:", error);
    }
  },

  addTask: async (task) => {
    try {
      const { data: newTask } = await axios.post<Task>("/tasks", {
        ...task,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      set({ tasks: [...get().tasks, newTask] });
    } catch (error) {
      console.error("Erro ao adicionar task:", error);
    }
  },

  updateTask: async (task) => {
    try {
      const { data: updatedTask } = await axios.put<Task>(`/tasks/${task.id}`, {
        ...task,
        updatedAt: new Date().toISOString(),
      });
      const updatedTasks = get().tasks.map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      );
      set({ tasks: updatedTasks });
    } catch (error) {
      console.error("Erro ao atualizar task:", error);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await axios.delete(`/tasks/${taskId}`);
      set({ tasks: get().tasks.filter((t) => t.id !== taskId) });
    } catch (error) {
      console.error("Erro ao deletar task:", error);
    }
  },

  // Computed property: retorna tasks filtradas
  get filteredTasks() {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      const statusMatch =
        filters.status === null ? true : task.status === filters.status;
      const userMatch =
        filters.userIds.length === 0
          ? true
          : filters.userIds.includes(task.assigneeId);
      return statusMatch && userMatch;
    });
  },
}));
