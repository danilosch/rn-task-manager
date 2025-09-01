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
  | {
      type: "add";
      task: Omit<Task, "id" | "createdAt" | "updatedAt">;
      tempId: string;
    }
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
            const { data } = await axios.get<User[]>("/users", {
              params: { sortBy: "name", order: "asc" },
            });
            set({ users: data });
          } catch (error) {
            console.error("Erro ao buscar users:", error);
          }
        },

        fetchTasks: async () => {
          const { limit } = get();
          set({ loading: true, page: 1, hasMore: true });
          try {
            const { data } = await axios.get<Task[]>("/tasks", {
              params: { page: 1, limit, sortBy: "createdAt", order: "desc" },
            });
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
            const { data } = await axios.get<Task[]>("/tasks", {
              params: { page, limit, sortBy: "createdAt", order: "desc" },
            });
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
          const { tasks, online, pendingOps } = get();
          const tempId = `temp-${Date.now()}`;

          const newTask: Task = {
            ...task,
            id: tempId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: false,
          };

          set({
            tasks: [newTask, ...tasks],
            pendingOps: online
              ? pendingOps
              : [...pendingOps, { type: "add", task, tempId }],
          });

          if (!online) return;

          try {
            const { data: created } = await axios.post<Task>("/tasks", {
              ...task,
              createdAt: new Date().toISOString(),
              updatedAt: null,
            });
            // Substitui o tempId pelo id real
            set({
              tasks: get().tasks.map((t) => (t.id === tempId ? created : t)),
            });
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
            const { data: updated } = await axios.put<Task>(
              `/tasks/${task.id}`,
              { ...task, updatedAt: new Date().toISOString() }
            );
            set({
              tasks: get().tasks.map((t) => (t.id === task.id ? updated : t)),
            });
          } catch (error) {
            console.error("Erro ao atualizar task:", error);
          }
        },

        deleteTask: async (taskId) => {
          const { tasks, online, pendingOps } = get();

          // Remove da lista local imediatamente
          set({ tasks: tasks.filter((t) => t.id !== taskId) });

          // Se for uma task temporária (offline) apenas remove da fila se existia
          if (taskId.startsWith("temp-")) {
            set({
              pendingOps: pendingOps.filter(
                (op) => !(op.type === "add" && op.tempId === taskId)
              ),
            });
            return;
          }

          // Se estiver offline, adiciona na fila de pendingOps para deletar depois
          if (!online) {
            set({ pendingOps: [...pendingOps, { type: "delete", taskId }] });
            return;
          }

          // Se online, chama o backend
          try {
            console.log("Deletando task online:", taskId);
            await axios.delete(`/tasks/${taskId.toString()}`);
          } catch (error) {
            console.error("Erro ao deletar task:", error);
            // Opcional: re-adiciona na fila caso dê erro
            set({
              pendingOps: [...get().pendingOps, { type: "delete", taskId }],
            });
          }
        },

        toggleTaskStatus: async (taskId) => {
          const current = get().tasks.find((t) => t.id === taskId);
          if (!current) return;

          const updated = {
            ...current,
            status: !current.status,
            updatedAt: new Date().toISOString(),
          };
          get().updateTask(updated);
        },

        syncPending: async () => {
          const ops = [...get().pendingOps];
          set({ pendingOps: [] });

          for (const op of ops) {
            try {
              if (op.type === "add") {
                await get().addTask(op.task);
              }
              if (op.type === "update") {
                await get().updateTask(op.task);
              }
              if (op.type === "delete") {
                await get().deleteTask(op.taskId);
              }
            } catch (e) {
              console.error("Erro ao sincronizar operação pendente:", e);
            }
          }
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
