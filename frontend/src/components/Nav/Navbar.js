import "./Navbar.css";
import logo from "../../logo.svg";
import { useAuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Fragment, useState } from "react";

export const Navbar = () => {
  const { user, logout } = useAuthContext();
  const [navOpen, setNavOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
    }, 100);
  };

  return (
    <nav className="navbar">
      <Link className="navbar__logo" to="/">
        <img src={logo} alt="logo" />
      </Link>

      <ul className="navbar__actions">
        {!user ? (
          <Fragment>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Sign up</Link>
            </li>
          </Fragment>
        ) : (
          <button
            className={`navbar__toggle_actions ${navOpen ? "navbar__toggle_actions--active" : ""}`}
            onClick={() => setNavOpen(!navOpen)}
          ></button>
        )}
      </ul>
      {user && navOpen && (
        <menu className="navbar__actions_menu">
          <div className="navbar__actions_menu__user">
            {user.displayName && (
              <Link
                className="navbar__actions_menu__user__display-name"
                to="/dashboard"
              >
                {user.displayName}
              </Link>
            )}
            <div className="navbar__actions_menu__user__username">
              @{user.username}
            </div>
          </div>
          <li className="navbar__actions_menu__item">
            <Link className="navbar__actions_menu__item__link" to="/dashboard">
              View dashboard
            </Link>
          </li>
          <div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </menu>
      )}
    </nav>
  );
};
