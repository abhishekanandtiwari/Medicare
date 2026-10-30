import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('medicare_token')
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('medicare_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const [theme, setThemeState] = useState(
    () => localStorage.getItem('medicare_theme') || 'light'
  );

  const [language, setLanguageState] = useState(
    () => localStorage.getItem('medicare_lang') || 'en'
  );

  const [elderlyMode, setElderlyModeState] = useState(
    () => localStorage.getItem('medicare_elderly_mode') === 'true'
  );

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      theme === 'dark'
    );

    localStorage.setItem('medicare_theme', theme);
  }, [theme]);

  const saveSession = useCallback((data) => {
    const accessToken =
      data?.access_token || data?.accessToken || data?.token;

    if (!accessToken) {
      throw new Error(
        'Authentication succeeded without an access token. Check the backend API response.'
      );
    }

    const userData = data.user || {
      id: data.user_id ?? data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    };

    localStorage.setItem('medicare_token', accessToken);
    localStorage.setItem(
      'medicare_user',
      JSON.stringify(userData)
    );

    setToken(accessToken);
    setUser(userData);

    return userData;
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const result = await api.login(email, password);
      return saveSession(result);
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const demoLogin = useCallback(async (role) => {
    const credentials = {
      patient: {
        email: 'patient@medicare.ai',
        password: 'Patient@123',
      },
      doctor: {
        email: 'doctor@medicare.ai',
        password: 'Doctor@123',
      },
      admin: {
        email: 'admin@medicare.ai',
        password: 'Admin@123',
      },
    };

    const selected = credentials[role];

    if (!selected) {
      throw new Error('Invalid demo account role.');
    }

    return login(selected.email, selected.password);
  }, [login]);

  const register = useCallback(async (userData) => {
    setLoading(true);

    try {
      const result = await api.register(userData);
      return saveSession(result);
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');

    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((previous) =>
      previous === 'light' ? 'dark' : 'light'
    );
  }, []);

  const setLanguage = useCallback((value) => {
    setLanguageState(value);
    localStorage.setItem('medicare_lang', value);
  }, []);

  const toggleElderlyMode = useCallback(() => {
    setElderlyModeState((previous) => {
      const next = !previous;
      localStorage.setItem(
        'medicare_elderly_mode',
        String(next)
      );
      return next;
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      // Connect your existing notifications API here.
      // Leave the current notification state unchanged if
      // the backend does not provide a notifications endpoint.
    } catch (error) {
      console.error('Unable to fetch notifications:', error);
    }
  }, [token]);

  const translations = {
    en: {},
    hi: {},
  };

  const t = useCallback((key) => {
    return translations[language]?.[key] || key;
  }, [language]);

  const contextValue = {
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
    fetchNotifications,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.'
    );
  }

  return context;
}

export default AuthContext;
