import { useParams } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingByID } from "../../api/listings";
import TCGdex from "@tcgdex/sdk";

export const Listing = () => {
  const tcgdex = new TCGdex("en");
  const { cardId } = useParams();
  const [card, setCard] = useState();

  const listingQuery = useQuery({
    queryKey: ["listings", cardId],
    queryFn: async () => {
      const listing = await getListingByID(cardId);
      const card = await tcgdex.card.get(listing.cardId);
      console.log(card);
      setCard(card);
      setValidListing(listing.seller.username !== null);
      return { ...listing, card };
    },
  });

  const [validListing, setValidListing] = useState(false);

  return (
    <div>
      <h1>Listing Item {cardId}</h1>
      {card && (
        <div>
          <h2>{card.name}</h2>
          <img src={card?.image + "/low.webp"} alt={card.name} />
        </div>
      )}
      <div>
        <p>Condition: {listingQuery.data?.condition}</p>
        <p>Price: ${listingQuery.data?.price.toFixed(2)}</p>
        {validListing ? (
          <a href={`/user/${listingQuery.data?.seller.username}`}>
            Seller:{" "}
            {listingQuery.data?.seller.displayName ? (
              <span>{listingQuery.data?.seller.displayName}</span>
            ) : (
              <span>{listingQuery.data?.seller.username}</span>
            )}
          </a>
        ) : (
          <p>Seller not found</p>
        )}
      </div>
    </div>
  );
};
