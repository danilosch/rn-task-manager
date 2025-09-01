import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axios from "../services/api";
import { Task, User } from "../types";

type TasksFilter = {
  userIds: string[];
  status: boolean | null;
};

type PendingOperation =
  | { type: "add"; task: Omit<Task, "id" | "createdAt" | "updatedAt"> }
  | { type: "update"; task: Task }
  | { type: "delete"; taskId: string };

type TasksStore = {
  tasks: Task[];
  users: User[];
  filters: TasksFilter;

  page: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;

  online: boolean;
  pendingOps: PendingOperation[];

  setTasks: (tasks: Task[]) => void;
  setUsers: (users: User[]) => void;
  setFilters: (filters: TasksFilter) => void;
  setOnline: (online: boolean) => void;

  fetchUsers: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchMoreTasks: () => Promise<void>;
  getFilteredTasks: () => Task[];

  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;

  syncPending: () => Promise<void>;
};

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => {
      // Observa status de conexão
      NetInfo.addEventListener((state) => {
        const currentlyOnline = state.isConnected ?? false;
        if (currentlyOnline && !get().online) {
          get().syncPending();
        }
        set({ online: currentlyOnline });
      });

      return {
        tasks: [],
        users: [],
        filters: { userIds: [], status: null },

        page: 1,
        limit: 10,
        hasMore: true,
        loading: false,

        online: true,
        pendingOps: [],

        setTasks: (tasks) => set({ tasks }),
        setUsers: (users) => set({ users }),
        setFilters: (filters) => set({ filters }),
        setOnline: (online) => set({ online }),

        fetchUsers: async () => {
          try {
            const params = { sortBy: "name", order: "asc" };
            const { data: users } = await axios.get<User[]>("/users", {
              params,
            });
            set({ users });
          } catch (error) {
            console.error("Erro ao buscar users:", error);
          }
        },

        fetchTasks: async () => {
          const { limit } = get();
          set({ loading: true, page: 1, hasMore: true, tasks: [] });
          try {
            const params = {
              page: 1,
              limit,
              sortBy: "createdAt",
              order: "desc",
            };
            const { data } = await axios.get<Task[]>("/tasks", { params });
            set({ tasks: data, page: 2, hasMore: data.length === limit });
          } catch (error) {
            console.error("Erro ao buscar tasks:", error);
          } finally {
            set({ loading: false });
          }
        },

        fetchMoreTasks: async () => {
          const { page, limit, hasMore, loading, tasks } = get();
          if (loading || !hasMore) return;

          set({ loading: true });
          try {
            const params = { page, limit, sortBy: "createdAt", order: "desc" };
            const { data } = await axios.get<Task[]>("/tasks", { params });

            // Evita duplicação
            const newTasks = data.filter(
              (t) => !tasks.some((existing) => existing.id === t.id)
            );

            set({
              tasks: [...tasks, ...newTasks],
              page: page + 1,
              hasMore: newTasks.length === limit,
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
          const { tasks, online, pendingOps } = get();

          if (!online) {
            const tempId = `temp-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 5)}`;
            const newTask: Task = {
              ...task,
              id: tempId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: false,
            };
            set({
              tasks: [newTask, ...tasks],
              pendingOps: [...pendingOps, { type: "add", task }],
            });
            return;
          }

          try {
            const { data: newTask } = await axios.post<Task>("/tasks", {
              ...task,
              createdAt: new Date().toISOString(),
              updatedAt: null,
            });
            set({ tasks: [newTask, ...tasks] });
          } catch (error) {
            console.error("Erro ao adicionar task:", error);
          }
        },

        updateTask: async (task) => {
          const { tasks, online, pendingOps } = get();
          set({ tasks: tasks.map((t) => (t.id === task.id ? task : t)) });

          if (!online) {
            set({ pendingOps: [...pendingOps, { type: "update", task }] });
            return;
          }

          try {
            const { data: updatedTask } = await axios.put<Task>(
              `/tasks/${task.id}`,
              { ...task, updatedAt: new Date().toISOString() }
            );
            set({
              tasks: get().tasks.map((t) =>
                t.id === task.id ? updatedTask : t
              ),
            });
          } catch (error) {
            console.error("Erro ao atualizar task:", error);
          }
        },

        deleteTask: async (taskId) => {
          const { tasks, online, pendingOps } = get();
          set({ tasks: tasks.filter((t) => t.id !== taskId) });

          if (!online) {
            set({ pendingOps: [...pendingOps, { type: "delete", taskId }] });
            return;
          }

          try {
            await axios.delete(`/tasks/${taskId}`);
          } catch (error) {
            console.error("Erro ao deletar task:", error);
          }
        },

        toggleTaskStatus: async (taskId) => {
          const { tasks } = get();
          const current = tasks.find((t) => t.id === taskId);
          if (!current) return;

          const updated = {
            ...current,
            status: !current.status,
            updatedAt: new Date().toISOString(),
          };
          get().updateTask(updated);
        },

        syncPending: async () => {
          console.log("Sincronizando operações pendentes...");
          const { pendingOps } = get();

          for (const op of pendingOps) {
            try {
              if (op.type === "add") {
                const { data: newTask } = await axios.post<Task>("/tasks", {
                  ...op.task,
                  createdAt: new Date().toISOString(),
                  updatedAt: null,
                });
                // substitui a temp task pelo real
                set({
                  tasks: get().tasks.map((t) =>
                    t.id.startsWith("temp-") && t.title === newTask.title
                      ? newTask
                      : t
                  ),
                });
              }

              if (op.type === "update") await get().updateTask(op.task);
              if (op.type === "delete") await get().deleteTask(op.taskId);
            } catch (e) {
              console.error("Erro ao sincronizar operação pendente:", e);
            }
          }

          set({ pendingOps: [] });
        },
      };
    },
    { name: "tasks-storage", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// sincronização automática ao voltar online
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    useTasksStore.getState().syncPending();
  }
});
