import "./Dashboard.css";
import { Fragment, useState, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Test } from "../../components/Test/Test";
import TCGdex from "@tcgdex/sdk";
export const Dashboard = () => {
  const tcgdex = new TCGdex("en");
  const { user, role } = useAuthContext();

  const [card, setCard] = useState(null);
  useEffect(() => {
    // console.log(user);
    const fetchCard = async () => {
      const card = await tcgdex.card.get("swsh3-136");
      setCard(card);
    };
    fetchCard();
  }, []);
  return (
    <Fragment>
      <h1>Dashboard</h1>

      <p>Welcome {user?.displayName || user?.username}</p>

      <section className="dashboard__wishlist">
        <h2>My wishlist</h2>
        <div className="dashboard__wishlist__cards">
          {Array(10)
            .fill(null)
            .map((_, i) => (
              <img src={card?.image + "/low.webp"} alt={card?.name} />
            ))}
        </div>
      </section>
    </Fragment>
  );
};
