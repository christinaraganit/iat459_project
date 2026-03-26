import "./Register.css";
import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { LinkButton } from "../LinkButton/LinkButton";

export const Register = () => {
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: account.username,
          password: account.password,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        // if the backend returns 201 Created, send them to the login page
        alert("Registration successful! Please log in.");
        navigate("/login");
      } else {
        // if the username is taken, show the error on the screen
        setError(data.message || data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Fragment>
      <form onSubmit={handleRegister}>
        <h1>Create an account</h1>
        <Input
          type="text"
          placeholder="Username"
          value={account.username}
          onChange={(e) => setAccount({ ...account, username: e.target.value })}
        />
        <Input
          type="password"
          placeholder="Password"
          value={account.password}
          onChange={(e) => setAccount({ ...account, password: e.target.value })}
        />
        <Button variant="primary" className="register__submit" type="submit">
          Sign up
        </Button>
        <LinkButton
          to="/login"
          variant="tertiary"
          className="register__login-link"
        >
          Already have an account? Log in
        </LinkButton>
      </form>
    </Fragment>
  );
};
