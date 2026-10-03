import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { translations } from '../utils/translations';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('medicare_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medicare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Internationalization & UI Preferences
  const [language, setLanguageState] = useState(() => localStorage.getItem('medicare_lang') || 'en');
  const [theme, setThemeState] = useState(() => localStorage.getItem('medicare_theme') || 'light');
  const [elderlyMode, setElderlyModeState] = useState(() => localStorage.getItem('medicare_elderly') === 'true');

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Translation helper
  const t = (key) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('medicare_theme', theme);
  }, [theme]);

  // Sync elderly mode class
  useEffect(() => {
    if (elderlyMode) {
      document.documentElement.classList.add('elderly-mode');
    } else {
      document.documentElement.classList.remove('elderly-mode');
    }
    localStorage.setItem('medicare_elderly', elderlyMode ? 'true' : 'false');
  }, [elderlyMode]);

  // Fetch current user details & notifications on mount
  useEffect(() => {
    async function initUser() {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('medicare_user', JSON.stringify(userData));
          fetchNotifications();
        } catch (err) {
          console.error("Session restoration failed:", err);
          logout();
        }
      }
      setLoading(false);
    }
    initUser();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    localStorage.setItem('medicare_token', data.access_token);

    const userObj = {
      id: data.user_id,
      email: data.email,
      name: data.name,
      role: data.role
    };
    setUser(userObj);
    localStorage.setItem('medicare_user', JSON.stringify(userObj));
    fetchNotifications();
    return userObj;
  };

  const demoLogin = async (role) => {
    const demoCredentials = {
      patient: { email: 'patient@medicare.ai', password: 'Patient@123' },
      doctor: { email: 'doctor@medicare.ai', password: 'Doctor@123' },
      admin: { email: 'admin@medicare.ai', password: 'Admin@123' }
    };
    const creds = demoCredentials[role] || demoCredentials.patient;
    return await login(creds.email, creds.password);
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    setToken(data.access_token);
    localStorage.setItem('medicare_token', data.access_token);

    const userObj = {
      id: data.user_id,
      email: data.email,
      name: data.name,
      role: data.role
    };
    setUser(userObj);
    localStorage.setItem('medicare_user', JSON.stringify(userObj));
    return userObj;
  };

  const logout = () => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('medicare_lang', lang);
  };

  const toggleElderlyMode = () => {
    setElderlyModeState((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role || null,
        loading,
        language,
        theme,
        elderlyMode,
        notifications,
        unreadCount,
        t,
        login,
        demoLogin,
        register,
        logout,
        toggleTheme,
        setLanguage,
        toggleElderlyMode,
        fetchNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
