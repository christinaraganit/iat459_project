import { Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
export const Layout = () => {
  const { user, logout } = useAuthContext();

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <span>{user}</span>
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
