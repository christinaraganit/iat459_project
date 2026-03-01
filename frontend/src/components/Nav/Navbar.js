import "./Navbar.css";
import logo from "../../logo.svg";
import { useAuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Fragment, useState } from "react";

export const Navbar = () => {
  const { user, logout } = useAuthContext();
  const [navOpen, setNavOpen] = useState(true);
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
        <menu className="navbar__menu">
          <div className="navbar__menu__user">
            {user.displayName && (
              <div className="navbar__menu__user__display-name">
                {user.displayName}
              </div>
            )}
            <div className="navbar__menu__user__username">@{user.username}</div>
          </div>

          <div>
            <button onClick={logout}>Logout</button>
          </div>
        </menu>
      )}
    </nav>
  );
};
