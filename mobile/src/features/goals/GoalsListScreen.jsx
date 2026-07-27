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
import { listGoals } from "./api";

const STATUS_LABELS = {
  active: "Faol",
  completed: "Tugallangan",
  archived: "Arxivlangan",
};

function GoalCard({ goal, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {goal.title}
        </Text>
        <Text style={styles.cardStatus}>{STATUS_LABELS[goal.status] || goal.status}</Text>
      </View>
      {goal.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {goal.description}
        </Text>
      ) : null}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${goal.progress_percent}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{goal.progress_percent}% bajarildi</Text>
    </TouchableOpacity>
  );
}

export default function GoalsListScreen({ navigation }) {
  const { authFetch } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchGoals = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await listGoals(authFetch);
      setGoals(data);
    } catch (err) {
      setLoadError(err.message || "Maqsadlarni yuklab bo'lmadi");
    }
  }, [authFetch]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchGoals().finally(() => setLoading(false));
    }, [fetchGoals])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
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
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={goals.length === 0 && styles.emptyContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <GoalCard goal={item} onPress={() => navigation.navigate("GoalDetail", { goalId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Hali maqsad yo'q. Pastdagi "+ Yangi maqsad" tugmasi orqali birinchisini qo'shing.
          </Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("GoalForm", {})}
      >
        <Text style={styles.fabText}>+ Yangi maqsad</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FC", paddingHorizontal: 16, paddingTop: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FC" },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
  emptyText: { textAlign: "center", color: "#6B7280", fontSize: 15, paddingHorizontal: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F4",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#1F2933", flexShrink: 1, marginRight: 8 },
  cardStatus: { fontSize: 12, fontWeight: "600", color: "#4F46E5" },
  cardDescription: { color: "#6B7280", fontSize: 14, marginTop: 6 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#4F46E5" },
  progressLabel: { fontSize: 12, color: "#6B7280", marginTop: 6 },
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
