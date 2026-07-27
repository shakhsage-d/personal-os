import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIORITY_COLORS = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#DC2626",
};

const PRIORITY_LABELS = {
  low: "Past",
  medium: "O'rta",
  high: "Yuqori",
};

export default function TaskRow({ task, onToggleDone, onPress }) {
  const isDone = task.status === "done";
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <TouchableOpacity
        style={[styles.checkbox, isDone && styles.checkboxChecked]}
        onPress={() => onToggleDone(task)}
      >
        {isDone ? <Text style={styles.checkmark}>✓</Text> : null}
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
          <Text style={styles.metaText}>{PRIORITY_LABELS[task.priority]}</Text>
          {task.due_date ? <Text style={styles.metaText}> · {task.due_date}</Text> : null}
          {task.goal_title ? <Text style={styles.metaText} numberOfLines={1}> · {task.goal_title}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEF0F4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: "#4F46E5" },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: "#1F2933" },
  titleDone: { textDecorationLine: "line-through", color: "#9CA3AF" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  metaText: { fontSize: 12, color: "#6B7280" },
});
