import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  userToken: string | null;
  userRole: string | null;
  isLoading: boolean;
  setUserAuth: (token: string | null, role: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userRole: null,
  isLoading: true,
  setUserAuth: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setToken] = useState<string | null>(null);
  const [userRole, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        if (token) setToken(token);
        if (role) setRole(role);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const setUserAuth = async (token: string | null, role: string | null) => {
    try {
      if (token && role) {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userRole', role);
      } else {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userRole');
      }
      setToken(token);
      setRole(role);
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const logout = async () => {
    await setUserAuth(null, null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, isLoading, setUserAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
