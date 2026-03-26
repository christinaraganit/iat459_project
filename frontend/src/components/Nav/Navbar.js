import "./Navbar.css";
import logo from "../../logo.svg";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Fragment, useState } from "react";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { LinkButton } from "../LinkButton/LinkButton";

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
      <LinkButton className="navbar__logo" to="/" variant="tertiary">
        <img src={logo} alt="logo" />
      </LinkButton>

      <div className="navbar__actions">
        <div className="navbar__search">
          <div
            className={`navbar__search__elements ${searchOpen ? "navbar__search__elements--active" : ""}`}
          >
            <div className="navbar__search__icon" />
            <Input
              className={`navbar__search__input ${searchOpen ? "navbar__search__input--active" : ""}`}
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <Button
              variant="secondary"
              className="navbar__search__confirm"
              onClick={() => navigate(`/search?s=${searchTerm}`)}
            >
              Search
            </Button>
          )}
          <Button
            variant="tertiary"
            className={`navbar__search__mobile_toggle ${searchOpen ? "navbar__search__mobile_toggle--active" : ""}`}
            onClick={handleSearchOpen}
          >
            <div className="navbar__search__icon" />
          </Button>
        </div>

        <menu
          className={`navbar__actions_menu ${user ? "navbar__actions_menu--activeUser" : ""} ${navOpen ? "navbar__actions_menu--active" : ""}`}
        >
          {user ? (
            <Fragment>
              <div className="navbar__actions_menu__user">
                <LinkButton
                  variant="tertiary"
                  className="navbar__actions_menu__user__display-name"
                  to="/dashboard"
                  onClick={handleRedirect}
                >
                  {user.displayName || user.username}
                </LinkButton>

                <div className="navbar__actions_menu__user__username">
                  @{user.username}
                </div>
              </div>
              <li className="navbar__actions_menu__item">
                <LinkButton
                  variant="tertiary"
                  className="navbar__actions_menu__item__link"
                  to="/dashboard"
                  onClick={handleRedirect}
                >
                  View dashboard
                </LinkButton>
              </li>
              <div>
                <Button variant="secondary" className="navbar__logout" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <li>
                <LinkButton to="/login" variant="secondary" className="navbar__login-link">
                  Login
                </LinkButton>
              </li>
              <li>
                <LinkButton to="/register" variant="primary" className="navbar__signup-link">
                  Sign up
                </LinkButton>
              </li>
            </Fragment>
          )}
        </menu>
        {role && (
          <LinkButton to="/dashboard/create" variant="primary" className="navbar__create-link">
            Create listing
          </LinkButton>
        )}
        {
          <Button
            variant="tertiary"
            className={`navbar__toggle_actions ${navOpen ? "navbar__toggle_actions--active" : ""}`}
            onClick={handleNavOpen}
          ></Button>
        }
      </div>
    </nav>
  );
};
