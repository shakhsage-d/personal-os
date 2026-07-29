import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../shared/auth/AuthContext";
import { Spinner, ErrorBanner } from "../../shared/ui/Feedback";
import { createProfileApi } from "./api";
import { ProfileForm } from "./components/ProfileForm";
import { PasswordForm, DeleteAccountSection } from "./components/SecuritySection";
import { NotificationPrefsForm } from "./components/NotificationPrefsForm";
import { ThemeSection } from "./components/ThemeSection";

const TABS = [
  { id: "profile", label: "Profil" },
  { id: "security", label: "Xavfsizlik" },
  { id: "notifications", label: "Bildirishnomalar" },
  { id: "appearance", label: "Ko'rinish" },
];

export function ProfilePage() {
  const { user, authFetch, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const profileApi = createProfileApi(authFetch);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileApi.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "notifications" && !settings) {
      loadSettings();
    }
  }, [activeTab, settings, loadSettings]);

  async function handleProfileSubmit(payload) {
    const updated = await profileApi.updateProfile(payload);
    updateUser(updated);
  }

  async function handlePasswordSubmit(payload) {
    await profileApi.changePassword(payload);
  }

  async function handleNotificationPrefsSubmit(payload) {
    const updated = await profileApi.updateSettings(payload);
    setSettings(updated);
  }

  async function handleDeleteAccount() {
    await profileApi.deleteAccount();
    logout();
  }

  return (
    <div className="profile-page">
      <div className="profile-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`profile-tab${activeTab === tab.id ? " profile-tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="profile-tab-panel">
        {activeTab === "profile" && <ProfileForm user={user} onSubmit={handleProfileSubmit} />}

        {activeTab === "security" && (
          <>
            <PasswordForm onSubmit={handlePasswordSubmit} />
            <DeleteAccountSection onConfirmDelete={handleDeleteAccount} />
          </>
        )}

        {activeTab === "notifications" && (
          <>
            <ErrorBanner message={error} onRetry={loadSettings} />
            {isLoading && <Spinner label="Sozlamalar yuklanmoqda..." />}
            {!isLoading && settings && (
              <NotificationPrefsForm
                settings={settings}
                onSubmit={handleNotificationPrefsSubmit}
              />
            )}
          </>
        )}

        {activeTab === "appearance" && <ThemeSection />}
      </div>
    </div>
  );
}
