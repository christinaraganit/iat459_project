import { Fragment, useState, useEffect } from "react";
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
    <Fragment>
      <h1>Listings near you</h1>
      <h2>Test</h2>
    </Fragment>
  );
};
