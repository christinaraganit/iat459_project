import { useParams } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingsFromUser } from "../../api/listings";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import TCGdex from "@tcgdex/sdk";
import { getUser } from "../../api/account";

export const User = () => {
  const tcgdex = new TCGdex("en");
  const { user } = useParams();
  const [isValidUser, setIsValidUser] = useState(false);

  const userQuery = useQuery({
    queryKey: ["username", user],
    queryFn: async () => {
      const res = await getUser(user);
      console.log("res", res);
      if (res.username) setIsValidUser(true);
      return res;
    },
  });

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

  return isValidUser ? (
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
  ) : (
    <div>Invalid user</div>
  );
};
