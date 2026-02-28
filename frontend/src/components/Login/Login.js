import { useAuthContext } from "../../context/AuthContext";
import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: account.username,
          password: account.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (er) {
      console.error("Login failed:", er);
    }
  };

  return (
    <Fragment>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={account.username}
          onChange={(e) => setAccount({ ...account, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={account.password}
          onChange={(e) => setAccount({ ...account, password: e.target.value })}
        />
        <button type="submit">Login</button>
      </form>

      <Link to="/register">Register</Link>
    </Fragment>
  );
};
