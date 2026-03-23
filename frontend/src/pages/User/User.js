import { useParams } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingsFromUser } from "../../api/listings";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import TCGdex from "@tcgdex/sdk";

export const User = () => {
  const tcgdex = new TCGdex("en");
  const { user } = useParams();
  const [card, setCard] = useState();

  const listingQuery = useQuery({
    queryKey: ["listings", user],
    queryFn: async () => {
      const listings = await getListingsFromUser(user);
      const cards = await Promise.all(
        listings?.map((listing) => tcgdex.card.get(listing.cardId)),
      );
      return listings.map((listing, i) => ({
        ...listing,
        card: cards[i],
      }));
    },
  });

  return (
    <div>
      <h1>Profile {user}</h1>
      <div className="listing__list">
        {listingQuery.data?.map((item) => (
          <ListingCard
            key={item._id}
            seller={item.seller}
            price={item.price}
            condition={item.condition}
            image={item.card?.getImageURL("low")}
            cardId={item.card?.id}
            cardName={item.card?.name}
            id={item._id}
          />
        ))}
      </div>
    </div>
  );
};
