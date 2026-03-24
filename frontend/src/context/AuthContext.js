import { jwtDecode } from "jwt-decode";
import { useState, useEffect, createContext, useContext } from "react";
import { getNewUserState, getDisplayName } from "../api/account";
import { useQueryClient } from "@tanstack/react-query";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username,
          displayName: decoded.displayName,
          id: decoded.id,
        });
        setRole(decoded.role);

        getNewUserState(token).then((data) => {
          setIsNewUser(data);
        });
      } catch (err) {
        console.log("Token is invalid or corrupted", err);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const reassignToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const login = (newToken) => {
    reassignToken(newToken);
    queryClient.invalidateQueries({
      queryKey: ["wishlist"],
    });
    queryClient.invalidateQueries({
      queryKey: ["listings"],
    });
    queryClient.invalidateQueries({
      queryKey: ["listingsOfInterest"],
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const updateDisplayName = (displayName) => {
    setUser((prevUser) => ({
      ...prevUser,
      displayName,
    }));
  };

  const activateNewUser = () => {
    setIsNewUser(false);
  };

  const contextItems = {
    token,
    user,
    role,
    isNewUser,
    updateDisplayName,
    activateNewUser,
    login,
    logout,
    reassignToken,
  };

  return <AuthContext value={contextItems}>{children}</AuthContext>;
};

export const useAuthContext = () => useContext(AuthContext);
