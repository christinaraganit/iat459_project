import { useState, useEffect } from "react";
import { Test } from "../../components/Test/Test";
import TCGdex from "@tcgdex/sdk";
export const Index = () => {
  const tcgdex = new TCGdex("en");

  const [card, setCard] = useState(null);
  useEffect(() => {
    const fetchCard = async () => {
      const card = await tcgdex.card.get("swsh3-136");
      setCard(card);
    };
    fetchCard();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {card !== null && (
          <img src={card.image + "/low.webp"} alt={card.name} />
        )}
        <Test />
      </header>
    </div>
  );
};
