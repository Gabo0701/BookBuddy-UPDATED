import React, { createContext, useState, useEffect } from 'react';
import { whoAmI } from '../api/auth';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  accessToken: null,
  setAccessToken: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken');
  });

  // Store token in localStorage when it changes
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      whoAmI(accessToken)
        .then((data) => setUser(data.user))
        .catch(() => {
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem('accessToken');
        });
    } else {
      localStorage.removeItem('accessToken');
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

