import "./Dashboard.css";
import { Fragment, useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Test } from "../../components/Test/Test";
import TCGdex from "@tcgdex/sdk";
export const Dashboard = () => {
  const tcgdex = new TCGdex("en");
  const { token, user, role } = useAuthContext();

  const [wishlist, setWishlist] = useState([]);

  const getWishlist = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/wishlist/${user?.username}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        },
      );
      const data = await res.json();
      console.log("Wishlist:", data);
      const cards = await Promise.all(
        data.map((cardId) => tcgdex.card.get(cardId)),
      );
      setWishlist(cards);
    } catch (er) {
      console.error("Failed to retrieve wishlist:", er);
    }
  };

  const addCardToWishlist = async (cardId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/wishlist/${user?.username}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ cardId }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        const card = await tcgdex.card.get(cardId);
        setWishlist([...wishlist, card]);
      }
    } catch (er) {
      console.error("Failed to add card to wishlist:", er);
    }
  };
  useEffect(() => {
    // console.log(user);
    if (user) getWishlist();
  }, [user]);

  useEffect(() => {
    console.log("Wishlist updated:", wishlist);
  }, [wishlist]);
  return (
    <Fragment>
      <h1>Dashboard</h1>

      <p>Welcome {user?.displayName || user?.username}</p>

      <section className="dashboard__wishlist">
        <h2>My wishlist ({wishlist?.length || 0})</h2>
        <div className="dashboard__wishlist__cards">
          {wishlist &&
            wishlist.map((card, i) => (
              <img
                key={`wishlist-card-${i}`}
                src={card?.image + "/low.webp"}
                alt={card?.name}
              />
            ))}
        </div>
        <button onClick={() => addCardToWishlist("swsh3-136")}>
          Add Ferret
        </button>
      </section>
    </Fragment>
  );
};
