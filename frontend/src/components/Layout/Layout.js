import { Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
export const Layout = () => {
  const { user, logout } = useAuthContext();

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <span>{user}</span>
          {user && <button onClick={logout}>Log out</button>}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
