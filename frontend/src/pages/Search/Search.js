import { Fragment, useState, useEffect } from "react";
import TCGdex from "@tcgdex/sdk";
export const Search = () => {
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
    <Fragment>
      <h1>xx results for y</h1>
    </Fragment>
  );
};
