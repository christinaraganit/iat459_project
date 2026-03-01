import "./Layout.css";
import { Outlet } from "react-router-dom";
import { Navbar } from "../Nav/Navbar";
export const Layout = () => {
  return (
    <div className="app">
      <header className="app__header">
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
