import { useParams } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingsFromUser } from "../../api/listings";
import { getWishlist } from "../../api/wishlist";
import { WishlistItem } from "../../components/Dashboard/WishlistItem/WishlistItem";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import TCGdex from "@tcgdex/sdk";
import { getUser } from "../../api/account";

export const User = () => {
  const tcgdex = new TCGdex("en");
  const { user } = useParams();

  const userQuery = useQuery({
    queryKey: ["username", user],
    queryFn: async () => {
      const res = await getUser(user);
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

  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user],
    queryFn: async () => {
      const data = await getWishlist(user);
      return await Promise.all(
        data?.map(async (item) => ({
          ...item,
          card: await tcgdex.card.get(item.cardId),
        })),
      );
    },
  });

  return userQuery.data ? (
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
      <section>
        <h2>Wishlist</h2>
        {wishlistQuery.data?.map((item) => (
          <WishlistItem key={item._id} card={item.card} item={item} />
        ))}
      </section>
    </div>
  ) : (
    <div>Invalid user</div>
  );
};
