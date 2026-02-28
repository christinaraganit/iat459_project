import { Outlet, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

import { useEffect } from "react";
export const Layout = () => {
  const { user, logout } = useAuthContext();
  useEffect(() => {
    console.log("User in Layout:", user);
  }, [user]);
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <span>{user?.username}</span>
          <span>{user?.displayName}</span>
          {!user ? (
            <div>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign up</Link>
            </div>
          ) : (
            <button onClick={logout}>Log out</button>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
