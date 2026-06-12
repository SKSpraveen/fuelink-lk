import React, {
  createContext,
  useState,
} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] =
    useState(null);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        setUserToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};