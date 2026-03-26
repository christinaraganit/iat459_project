import { Link } from "react-router-dom";
import "../Button/Button.css";
import "./LinkButton.css";

export const LinkButton = ({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  to,
  href,
  onClick,
  ...props
}) => {
  const classes = `button button--${variant} link-button${className ? ` ${className}` : ""}${disabled ? " link-button--disabled" : ""}`;

  const handleClick = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  if (to) {
    return (
      <Link
        to={disabled ? "#" : to}
        className={classes}
        onClick={handleClick}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={disabled ? undefined : href}
      className={classes}
      onClick={handleClick}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      {...props}
    >
      {children}
    </a>
  );
};
