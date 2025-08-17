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
  const [accessToken, setAccessToken] = useState(null);

  // On mount, see if we already have a cookie/session
  useEffect(() => {
    if (accessToken) {
      whoAmI(accessToken)
        .then((data) => setUser(data.user))
        .catch(() => {
          setUser(null);
          setAccessToken(null);
        });
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

