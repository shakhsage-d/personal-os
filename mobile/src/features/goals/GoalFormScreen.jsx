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
import { createGoal } from "./api";

// Sana YYYY-MM-DD formatida oddiy matn maydoni orqali kiritiladi — mobil
// uchun native sana-tanlagich (`@react-native-community/datetimepicker`)
// keyingi bosqichda qo'shilishi mumkin, hozircha MVP doirasida soddalik
// birinchi o'rinda (roadmap, $0-byudjet/soddalik tamoyili).
export default function GoalFormScreen({ navigation }) {
  const { authFetch } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
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
      await createGoal(authFetch, {
        title: title.trim(),
        description: description.trim(),
        targetDate: targetDate.trim() || null,
      });
      navigation.goBack();
    } catch (err) {
      setFormError(err.message || "Maqsad yaratib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.label}>Sarlavha</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Masalan: Yangi til o'rganish" />

      <Text style={styles.label}>Tavsif (ixtiyoriy)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Qisqacha tavsif"
        multiline
      />

      <Text style={styles.label}>Muddat (YYYY-MM-DD, ixtiyoriy)</Text>
      <TextInput
        style={styles.input}
        value={targetDate}
        onChangeText={setTargetDate}
        placeholder="2026-12-31"
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Saqlash</Text>}
      </TouchableOpacity>
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
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { color: "#DC2626", marginTop: 12 },
});
