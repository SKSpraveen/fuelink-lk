import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

/*
|--------------------------------------------------------------------------
| USER TYPE
|--------------------------------------------------------------------------
*/

type UserType = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

/*
|--------------------------------------------------------------------------
| AUTH CONTEXT TYPE
|--------------------------------------------------------------------------
*/

type AuthContextType = {
  userToken: string | null;
  userRole: string | null;
  user: UserType | null;
  isLoading: boolean;

  setUserAuth: (
    token: string | null,
    role: string | null,
    user?: UserType | null
  ) => Promise<void>;

  logout: () => Promise<void>;
};

/*
|--------------------------------------------------------------------------
| CONTEXT
|--------------------------------------------------------------------------
*/

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userRole: null,
  user: null,
  isLoading: true,

  setUserAuth: async () => {},

  logout: async () => {},
});

/*
|--------------------------------------------------------------------------
| CUSTOM HOOK
|--------------------------------------------------------------------------
*/

export const useAuth = () => useContext(AuthContext);

/*
|--------------------------------------------------------------------------
| PROVIDER
|--------------------------------------------------------------------------
*/

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [userToken, setToken] = useState<string | null>(null);

  const [userRole, setRole] = useState<string | null>(null);

  const [user, setUser] = useState<UserType | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | LOAD SAVED AUTH DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');

        const role = await AsyncStorage.getItem('userRole');

        const userData =
          await AsyncStorage.getItem('user');

        if (token) {
          setToken(token);
        }

        if (role) {
          setRole(role);
        }

        if (userData) {
          setUser(JSON.parse(userData));
        }

      } catch (e) {
        console.error(
          'Failed to load auth data',
          e
        );

      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SAVE AUTH DATA
  |--------------------------------------------------------------------------
  */

  const setUserAuth = async (
    token: string | null,
    role: string | null,
    userData?: UserType | null
  ) => {
    try {
      if (token && role) {

        await AsyncStorage.setItem(
          'userToken',
          token
        );

        await AsyncStorage.setItem(
          'userRole',
          role
        );

        if (userData) {
          await AsyncStorage.setItem(
            'user',
            JSON.stringify(userData)
          );

          setUser(userData);
        }

      } else {

        await AsyncStorage.removeItem(
          'userToken'
        );

        await AsyncStorage.removeItem(
          'userRole'
        );

        await AsyncStorage.removeItem(
          'user'
        );

        setUser(null);
      }

      setToken(token);

      setRole(role);

    } catch (e) {
      console.error(
        'Failed to save auth data',
        e
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    await setUserAuth(null, null);
  };

  /*
  |--------------------------------------------------------------------------
  | PROVIDER VALUE
  |--------------------------------------------------------------------------
  */

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userRole,
        user,
        isLoading,
        setUserAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};