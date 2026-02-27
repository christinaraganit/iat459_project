import { useAuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const { token } = useAuthContext();

  return !token ? <Navigate to="/" /> : children;
};
