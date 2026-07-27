import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../shared/auth/AuthContext";
import { createTask, deleteTask, updateTask } from "./api";

const PRIORITIES = ["low", "medium", "high"];
const PRIORITY_LABELS = { low: "Past", medium: "O'rta", high: "Yuqori" };

export default function TaskFormScreen({ navigation, route }) {
  const { authFetch } = useAuth();
  const existingTask = route.params?.task;
  const presetGoalId = route.params?.goalId;
  const isEditing = Boolean(existingTask);

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [dueDate, setDueDate] = useState(existingTask?.due_date || "");
  const [priority, setPriority] = useState(existingTask?.priority || "medium");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const onSubmit = async () => {
    if (!title.trim()) {
      setFormError("Sarlavha kiritilishi shart");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      if (isEditing) {
        await updateTask(authFetch, existingTask.id, {
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate.trim() || null,
          priority,
        });
      } else {
        await createTask(authFetch, {
          title: title.trim(),
          description: description.trim(),
          goalId: presetGoalId || null,
          priority,
          dueDate: dueDate.trim() || null,
        });
      }
      navigation.goBack();
    } catch (err) {
      setFormError(err.message || "Saqlab bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    setSubmitting(true);
    try {
      await deleteTask(authFetch, existingTask.id);
      navigation.goBack();
    } catch (err) {
      setFormError(err.message || "O'chirib bo'lmadi");
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.label}>Sarlavha</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Masalan: Kitob o'qish" />

      <Text style={styles.label}>Tavsif (ixtiyoriy)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Qisqacha tavsif"
        multiline
      />

      <Text style={styles.label}>Muddat (YYYY-MM-DD, ixtiyoriy)</Text>
      <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="2026-08-01" />

      <Text style={styles.label}>Ustuvorlik</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.priorityChip, priority === p && styles.priorityChipActive]}
            onPress={() => setPriority(p)}
          >
            <Text style={[styles.priorityChipText, priority === p && styles.priorityChipTextActive]}>
              {PRIORITY_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Saqlash</Text>}
      </TouchableOpacity>

      {isEditing ? (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete} disabled={submitting}>
          <Text style={styles.deleteButtonText}>Vazifani o'chirish</Text>
        </TouchableOpacity>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FC", padding: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#4B5563", marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E5EA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E5EA",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  priorityChipActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  priorityChipText: { color: "#4B5563", fontWeight: "600" },
  priorityChipTextActive: { color: "#fff" },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteButton: { alignItems: "center", marginTop: 16, paddingVertical: 10 },
  deleteButtonText: { color: "#DC2626", fontWeight: "600" },
  error: { color: "#DC2626", marginTop: 12 },
});
