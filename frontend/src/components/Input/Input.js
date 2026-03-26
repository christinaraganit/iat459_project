import "./Input.css";

export const Input = ({ className = "", ...props }) => {
  const classes = `input${className ? ` ${className}` : ""}`;

  return <input className={classes} {...props} />;
};
