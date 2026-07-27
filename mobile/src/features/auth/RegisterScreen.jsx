import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../shared/auth/AuthContext";

export default function RegisterScreen({ navigation }) {
  const { register, login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const onSubmit = async () => {
    setFormError(null);
    setSubmitting(true);
    try {
      await register({ email: email.trim(), password, fullName: fullName.trim() });
      // Ro'yxatdan o'tgach darhol kirish — ayri "kirish" bosqichini talab
      // qilmaslik uchun (mobil UX: kamroq qadam).
      await login({ email: email.trim(), password });
    } catch (err) {
      setFormError(err.message || "Ro'yxatdan o'tish muvaffaqiyatsiz tugadi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Ro'yxatdan o'tish</Text>

      <TextInput
        style={styles.input}
        placeholder="To'liq ism (ixtiyoriy)"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Parol (kamida 8 belgi, 1 raqam)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ro'yxatdan o'tish</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Hisobingiz bormi? Kiring</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F8F9FC",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2933",
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E5EA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#4F46E5",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
  error: {
    color: "#DC2626",
    marginBottom: 12,
    fontSize: 14,
  },
});
