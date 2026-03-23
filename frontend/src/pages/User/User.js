import { useParams } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingByID, getListingsFromUser } from "../../api/listings";
import TCGdex from "@tcgdex/sdk";

export const User = () => {
  const tcgdex = new TCGdex("en");
  const { user } = useParams();
  const [card, setCard] = useState();

  const listingQuery = useQuery({
    queryKey: ["listings", user],
    queryFn: async () => {
      const listings = await getListingsFromUser(user);
      // const card = await tcgdex.card.get(listing.cardId);
      console.log(listings);
      return { listings };
    },
  });

  return (
    <div>
      <h1>Profile {user}</h1>
    </div>
  );
};
