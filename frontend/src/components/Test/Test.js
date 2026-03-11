import { useAuthContext } from "../../context/AuthContext";
export const Test = ({ username = "admin", password = "admin" }) => {
  const { token } = useAuthContext();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:5000/api/account/wishlist/${username}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        },
      );
      const data = await res.json();
      console.log(data);
    } catch (er) {
      console.error("Failed to retrieve wishlist:", er);
    }
  };

  return (
    <button
      style={{ padding: "1rem", background: "red", color: "white" }}
      onClick={handleLogin}
    >
      Test wishlist
    </button>
  );
};
