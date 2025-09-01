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

  // Paginação
  page: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;

  setTasks: (tasks: Task[]) => void;
  setUsers: (users: User[]) => void;
  setFilters: (filters: TasksFilter) => void;

  fetchUsers: () => Promise<void>;

  // Faz reset e carrega a 1ª página
  fetchTasks: () => Promise<void>;
  // Busca páginas seguintes e faz append
  fetchMoreTasks: () => Promise<void>;

  getFilteredTasks: () => Task[];

  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
};

export const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: [],
  users: [],
  filters: { userIds: [], status: null },

  // Paginação
  page: 1,
  limit: 10,
  hasMore: true,
  loading: false,

  setTasks: (tasks) => set({ tasks }),
  setUsers: (users) => set({ users }),
  setFilters: (filters) => set({ filters }),

  fetchUsers: async () => {
    try {
      const params = { sortBy: "name", order: "asc" };
      const { data: users } = await axios.get<User[]>("/users", { params });
      set({ users });
    } catch (error) {
      console.error("Erro ao buscar users:", error);
    }
  },

  // Reset + 1ª página
  fetchTasks: async () => {
    const { limit } = get();

    set({ loading: true, page: 1, hasMore: true, tasks: [] });
    try {
      const params = { page: 1, limit, sortBy: "createdAt", order: "desc" };
      const { data } = await axios.get<Task[]>("/tasks", { params });

      set({
        tasks: data,
        page: 2, // Próxima página
        hasMore: data.length === limit, // Se veio menos que limit, não há mais
      });
    } catch (error) {
      console.error("Erro ao buscar tasks:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Próximas páginas (append)
  fetchMoreTasks: async () => {
    const { page, limit, hasMore, loading, tasks } = get();
    if (loading || !hasMore) return;

    set({ loading: true });
    try {
      const params = { page, limit, sortBy: "createdAt", order: "desc" };
      const { data } = await axios.get<Task[]>("/tasks", { params });

      set({
        tasks: [...tasks, ...data],
        page: page + 1,
        hasMore: data.length === limit,
      });
    } catch (error) {
      console.error("Erro ao buscar mais tasks:", error);
    } finally {
      set({ loading: false });
    }
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      const statusMatch =
        filters.status === null ? true : task.status === filters.status;
      const userMatch =
        filters.userIds.length === 0
          ? true
          : filters.userIds.includes(task.userId);
      return statusMatch && userMatch;
    });
  },

  addTask: async (task) => {
    try {
      const { data: newTask } = await axios.post<Task>("/tasks", {
        ...task,
        createdAt: new Date().toISOString(),
        updatedAt: null,
      });
      // Adiciona ao topo localmente
      set({ tasks: [newTask, ...get().tasks] });
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

  // Atalho para alternar status (checkbox)
  toggleTaskStatus: async (taskId) => {
    const current = get().tasks.find((t) => t.id === taskId);
    if (!current) return;
    const payload: Task = {
      ...current,
      status: !current.status,
      updatedAt: new Date().toISOString(),
    };
    try {
      const { data } = await axios.put<Task>(`/tasks/${taskId}`, payload);
      set({
        tasks: get().tasks.map((t) => (t.id === taskId ? data : t)),
      });
    } catch (e) {
      console.error("Erro ao alternar status:", e);
    }
  },
}));
