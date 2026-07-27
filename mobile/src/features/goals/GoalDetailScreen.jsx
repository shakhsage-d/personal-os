import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../shared/auth/AuthContext";
import { deleteGoal, getGoal, updateMilestone } from "./api";
import { listTasks, toggleTaskDone } from "../tasks/api";
import TaskRow from "../tasks/TaskRow";

export default function GoalDetailScreen({ navigation, route }) {
  const { goalId } = route.params;
  const { authFetch } = useAuth();
  const [goal, setGoal] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoadError(null);
    try {
      const [goalData, taskData] = await Promise.all([
        getGoal(authFetch, goalId),
        listTasks(authFetch, { goalId }),
      ]);
      setGoal(goalData);
      setTasks(taskData);
    } catch (err) {
      setLoadError(err.message || "Ma'lumotlarni yuklab bo'lmadi");
    }
  }, [authFetch, goalId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAll().finally(() => setLoading(false));
    }, [fetchAll])
  );

  const onToggleMilestone = async (milestone) => {
    setGoal((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestone.id ? { ...m, is_completed: !m.is_completed } : m
      ),
    }));
    try {
      await updateMilestone(authFetch, goalId, milestone.id, {
        is_completed: !milestone.is_completed,
      });
      fetchAll();
    } catch {
      fetchAll();
    }
  };

  const onToggleTask = async (task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t))
    );
    try {
      await toggleTaskDone(authFetch, task);
    } catch {
      fetchAll();
    }
  };

  const onDeleteGoal = async () => {
    try {
      await deleteGoal(authFetch, goalId);
      navigation.goBack();
    } catch (err) {
      setLoadError(err.message || "Maqsadni o'chirib bo'lmadi");
    }
  };

  if (loading || !goal) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

      <Text style={styles.title}>{goal.title}</Text>
      {goal.description ? <Text style={styles.description}>{goal.description}</Text> : null}
      {goal.target_date ? <Text style={styles.meta}>Muddat: {goal.target_date}</Text> : null}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${goal.progress_percent}%` }]} />
      </View>
      <Text style={styles.meta}>{goal.progress_percent}% bajarildi</Text>

      <Text style={styles.sectionTitle}>Bosqichlar</Text>
      {goal.milestones.length === 0 ? (
        <Text style={styles.emptyText}>Bosqichlar qo'shilmagan.</Text>
      ) : (
        goal.milestones.map((m) => (
          <TouchableOpacity key={m.id} style={styles.milestoneRow} onPress={() => onToggleMilestone(m)}>
            <View style={[styles.checkbox, m.is_completed && styles.checkboxChecked]}>
              {m.is_completed ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={[styles.milestoneText, m.is_completed && styles.milestoneTextDone]}>{m.title}</Text>
          </TouchableOpacity>
        ))
      )}

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Ushbu maqsadga bog'liq vazifalar</Text>
        <TouchableOpacity onPress={() => navigation.navigate("TaskForm", { goalId })}>
          <Text style={styles.addLink}>+ Vazifa qo'shish</Text>
        </TouchableOpacity>
      </View>
      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>Bog'liq vazifa yo'q.</Text>
      ) : (
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggleDone={onToggleTask}
            onPress={() => navigation.navigate("TaskForm", { task })}
          />
        ))
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={onDeleteGoal}>
        <Text style={styles.deleteButtonText}>Maqsadni o'chirish</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FC" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FC" },
  title: { fontSize: 22, fontWeight: "700", color: "#1F2933" },
  description: { fontSize: 15, color: "#6B7280", marginTop: 6 },
  meta: { fontSize: 13, color: "#6B7280", marginTop: 6 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4F46E5" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2933", marginTop: 24, marginBottom: 10 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  addLink: { color: "#4F46E5", fontWeight: "600", fontSize: 13 },
  emptyText: { color: "#6B7280", fontSize: 14, marginBottom: 8 },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEF0F4",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: "#4F46E5" },
  checkmark: { color: "#fff", fontSize: 12, fontWeight: "700" },
  milestoneText: { fontSize: 14, color: "#1F2933", flexShrink: 1 },
  milestoneTextDone: { textDecorationLine: "line-through", color: "#9CA3AF" },
  deleteButton: { alignItems: "center", marginTop: 24, paddingVertical: 10 },
  deleteButtonText: { color: "#DC2626", fontWeight: "600" },
  error: { color: "#DC2626", marginBottom: 8 },
});
