import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useAuth } from "../shared/auth/AuthContext";
import { registerForPushNotificationsAsync } from "../shared/notifications/registerPushToken";

import LoginScreen from "../features/auth/LoginScreen";
import RegisterScreen from "../features/auth/RegisterScreen";
import GoalsListScreen from "../features/goals/GoalsListScreen";
import GoalDetailScreen from "../features/goals/GoalDetailScreen";
import GoalFormScreen from "../features/goals/GoalFormScreen";
import TasksListScreen from "../features/tasks/TasksListScreen";
import TaskFormScreen from "../features/tasks/TaskFormScreen";

const AuthStack = createNativeStackNavigator();
const GoalsStack = createNativeStackNavigator();
const TasksStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
      <Text style={styles.logoutText}>Chiqish</Text>
    </TouchableOpacity>
  );
}

function GoalsNavigator() {
  return (
    <GoalsStack.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
      <GoalsStack.Screen name="GoalsList" component={GoalsListScreen} options={{ title: "Maqsadlar" }} />
      <GoalsStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: "Maqsad" }} />
      <GoalsStack.Screen name="GoalForm" component={GoalFormScreen} options={{ title: "Yangi maqsad" }} />
      <GoalsStack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: "Vazifa" }} />
    </GoalsStack.Navigator>
  );
}

function TasksNavigator() {
  return (
    <TasksStack.Navigator screenOptions={{ headerRight: () => <LogoutButton /> }}>
      <TasksStack.Screen name="TasksList" component={TasksListScreen} options={{ title: "Vazifalar" }} />
      <TasksStack.Screen name="TaskForm" component={TaskFormScreen} options={{ title: "Vazifa" }} />
    </TasksStack.Navigator>
  );
}

function AuthenticatedTabs() {
  const { authFetch } = useAuth();

  // Login qilingandan so'ng push-notification ruxsatini so'rash va tokenni
  // backend'ga ro'yxatdan o'tkazish (roadmap 11-Qavat DoD).
  useEffect(() => {
    registerForPushNotificationsAsync(authFetch);
  }, [authFetch]);

  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="GoalsTab" component={GoalsNavigator} options={{ title: "Maqsadlar" }} />
      <Tabs.Screen name="TasksTab" component={TasksNavigator} options={{ title: "Vazifalar" }} />
    </Tabs.Navigator>
  );
}

function UnauthenticatedStack() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedTabs /> : <UnauthenticatedStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8F9FC" },
  logoutButton: { marginRight: 12 },
  logoutText: { color: "#4F46E5", fontWeight: "600" },
});
