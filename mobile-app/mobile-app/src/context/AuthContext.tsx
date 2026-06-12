import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  userToken: string | null;
  isLoading: boolean;
  setUserToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  isLoading: true,
  setUserToken: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) setToken(token);
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const setUserToken = async (token: string | null) => {
    try {
      if (token) {
        await AsyncStorage.setItem('userToken', token);
      } else {
        await AsyncStorage.removeItem('userToken');
      }
      setToken(token);
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const logout = async () => {
    await setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, setUserToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
