import "./Navbar.css";
import logo from "../../logo.svg";
import { useAuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Fragment, useState } from "react";

export const Navbar = () => {
  const { user, logout, role } = useAuthContext();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
      setNavOpen(false);
    }, 100);
  };

  const handleNavOpen = () => {
    if (searchOpen) {
      setSearchOpen(false);
    }
    setNavOpen(!navOpen);
  };

  const handleSearchOpen = () => {
    if (navOpen) {
      setNavOpen(false);
    }
    setSearchOpen(!searchOpen);
  };

  const handleRedirect = () => {
    if (navOpen) {
      setNavOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <Link className="navbar__logo" to="/">
        <img src={logo} alt="logo" />
      </Link>

      <div className="navbar__actions">
        <div className="navbar__search">
          <div
            className={`navbar__search__elements ${searchOpen ? "navbar__search__elements--active" : ""}`}
          >
            <div className="navbar__search__icon" />
            <input
              className={`navbar__search__input ${searchOpen ? "navbar__search__input--active" : ""}`}
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <button
              className="navbar__search__confirm"
              onClick={() => navigate(`/search?s=${searchTerm}`)}
            >
              Search
            </button>
          )}
          <button
            className={`navbar__search__mobile_toggle ${searchOpen ? "navbar__search__mobile_toggle--active" : ""}`}
            onClick={handleSearchOpen}
          >
            <div className="navbar__search__icon" />
          </button>
        </div>

        <menu
          className={`navbar__actions_menu ${user ? "navbar__actions_menu--activeUser" : ""} ${navOpen ? "navbar__actions_menu--active" : ""}`}
        >
          {user ? (
            <Fragment>
              <div className="navbar__actions_menu__user">
                <Link
                  className="navbar__actions_menu__user__display-name"
                  to="/dashboard"
                  onClick={handleRedirect}
                >
                  {user.displayName || user.username}
                </Link>

                <div className="navbar__actions_menu__user__username">
                  @{user.username}
                </div>
              </div>
              <li className="navbar__actions_menu__item">
                <Link
                  className="navbar__actions_menu__item__link"
                  to="/dashboard"
                  onClick={handleRedirect}
                >
                  View dashboard
                </Link>
              </li>
              <div>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Sign up</Link>
              </li>
            </Fragment>
          )}
        </menu>
        {role && <Link to="/dashboard/create">Create listing</Link>}
        {
          <button
            className={`navbar__toggle_actions ${navOpen ? "navbar__toggle_actions--active" : ""}`}
            onClick={handleNavOpen}
          ></button>
        }
      </div>
    </nav>
  );
};
