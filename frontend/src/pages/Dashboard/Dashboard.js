import logo from "../../logo.svg";
import { useState, useEffect } from "react";
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
    <div className="App">
      <header className="App-header">
        <h1>Dashboard</h1>

        <p>Welcome {user?.displayName || user?.username}</p>

        {card !== null && (
          <img src={card.image + "/low.webp"} alt={card.name} />
        )}
        <Test />
      </header>
    </div>
  );
};
