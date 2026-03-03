import "./Dashboard.css";
import { Fragment, useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { CreateListing } from "../../components/Listing/CreateListing";
import TCGdex from "@tcgdex/sdk";
export const Dashboard = () => {
  const tcgdex = new TCGdex("en");
  const { token, user, role } = useAuthContext();

  const [fieldname, setFieldname] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [newListingOpen, setNewListingOpen] = useState(false);

  const getWishlist = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/account/wishlist/${user?.username}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        },
      );
      const data = await res.json();
      console.log("Wishlist:", data);
      if (data) {
        const cards = await Promise.all(
          data.map((cardId) => tcgdex.card.get(cardId)),
        );
        setWishlist(cards);
      }
    } catch (er) {
      console.error("Failed to retrieve wishlist:", er);
    }
  };

  const addCardToWishlist = async (cardId) => {
    if (cardId === "") {
      alert("Please enter a card ID");
      return;
    }
    try {
      const card = await tcgdex.card.get(cardId);
      if (!card) {
        alert("Card not found");
        return;
      }
      const res = await fetch(
        `http://localhost:5000/api/account/wishlist/${user?.username}`,
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
      console.log("Add to wishlist response:", data);
      if (res.ok) {
        setWishlist([...wishlist, card]);
      }
    } catch (er) {
      console.error("Failed to add card to wishlist:", er);
    }
  };

  const removeCardFromWishlist = async (index) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/account/wishlist/${user?.username}/${index}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ index }),
        },
      );
      const data = await res.json();
      console.log("Remove from wishlist response:", data);
      if (res.ok) {
        setWishlist(wishlist.filter((_, i) => i !== index));
      }
    } catch (er) {
      console.error("Failed to remove card from wishlist:", er);
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

      <section className="dashboard__section dashboard__wishlist">
        <h2>My wishlist ({wishlist?.length || 0})</h2>
        <div className="dashboard__wishlist__cards">
          {wishlist &&
            wishlist.map((card, i) => (
              <img
                key={`wishlist-card-${i}`}
                src={card?.image + "/low.webp"}
                alt={card?.name}
                onClick={() => removeCardFromWishlist(i)}
                style={{
                  cursor: "pointer",
                }}
              />
            ))}
        </div>
        <input
          type="text"
          value={fieldname}
          onChange={(e) => setFieldname(e.target.value)}
        />
        <button onClick={() => addCardToWishlist(fieldname)}>
          Add card by ID
        </button>
        <button onClick={() => removeCardFromWishlist(0)}>Delete card</button>
      </section>
      <section className="dashboard__section dashboard__offers">
        <h2>My offers (x)</h2>
        <button onClick={() => setNewListingOpen(!newListingOpen)}>
          Create new offer
        </button>
        {newListingOpen && (
          <CreateListing username={user?.username} token={token} />
        )}
      </section>
    </Fragment>
  );
};
