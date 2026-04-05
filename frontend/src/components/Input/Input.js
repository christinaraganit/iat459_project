import "./Input.css";

export const Input = ({ className = "", type, ...props }) => {
  const isToggle = type === "checkbox" || type === "radio";
  const classes = [
    "input",
    isToggle && "input--toggle",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} type={type} {...props} />;
};
