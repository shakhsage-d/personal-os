import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../shared/auth/AuthContext";
import { listTasks, toggleTaskDone } from "./api";
import TaskRow from "./TaskRow";

export default function TasksListScreen({ navigation }) {
  const { authFetch } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await listTasks(authFetch);
      setTasks(data);
    } catch (err) {
      setLoadError(err.message || "Vazifalarni yuklab bo'lmadi");
    }
  }, [authFetch]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTasks().finally(() => setLoading(false));
    }, [fetchTasks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const onToggleDone = async (task) => {
    // Optimistik yangilash — ro'yxat darhol javob beradi, xato bo'lsa geri qaytariladi.
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t))
    );
    try {
      await toggleTaskDone(authFetch, task);
    } catch {
      await fetchTasks();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tasks.length === 0 && styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onToggleDone={onToggleDone}
            onPress={() => navigation.navigate("TaskForm", { task: item })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Hali vazifa yo'q. Pastdagi "+ Yangi vazifa" tugmasi orqali birinchisini qo'shing.
          </Text>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("TaskForm", {})}>
        <Text style={styles.fabText}>+ Yangi vazifa</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FC", paddingHorizontal: 16, paddingTop: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FC" },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
  emptyText: { textAlign: "center", color: "#6B7280", fontSize: 15, paddingHorizontal: 24 },
  fab: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 12,
  },
  fabText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  error: { color: "#DC2626", marginBottom: 8 },
});
