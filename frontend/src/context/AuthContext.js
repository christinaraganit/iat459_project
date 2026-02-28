import { jwtDecode } from "jwt-decode";
import { useState, useEffect, createContext, useContext } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log(decoded);
        setUser({
          username: decoded.username,
          displayName: decoded.displayName,
        });
        setRole(decoded.role);
      } catch (err) {
        console.log("Token is invalid or corrupted", err);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const contextItems = {
    token,
    user,
    role,
    login,
    logout,
  };

  return <AuthContext value={contextItems}>{children}</AuthContext>;
};

export const useAuthContext = () => useContext(AuthContext);
