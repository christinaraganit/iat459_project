import "./Button.css";

export const Button = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props
}) => {
  const classes = `button button--${variant}${className ? ` ${className}` : ""}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
