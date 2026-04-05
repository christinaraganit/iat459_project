import { useParams } from "react-router";
import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingsFromUser } from "../../api/listings";
import { getWishlist } from "../../api/wishlist";
import { WishlistItem } from "../../components/Dashboard/NameField/WishlistItem/WishlistItem";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import TCGdex from "@tcgdex/sdk";
import { getUser } from "../../api/account";
import "../Dashboard/Dashboard.css";

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
    enabled: Boolean(userQuery.data?.username),
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
    enabled: Boolean(userQuery.data?.username),
  });

  if (userQuery.isLoading) {
    return (
      <section className="dashboard__section">
        <p className="dashboard__preferred-location-meta">Loading profile…</p>
      </section>
    );
  }

  const profile = userQuery.data;
  if (!profile?.username) {
    return (
      <section className="dashboard__section">
        <h1>Profile not found</h1>
        <p className="dashboard__preferred-location-meta">
          We couldn’t find a user with that username.
        </p>
      </section>
    );
  }

  const listings = listingQuery.data ?? [];
  const wishlist = wishlistQuery.data ?? [];
  const displayLabel = profile.displayName?.trim() || profile.username;

  return (
    <Fragment>
      <h1>
        {displayLabel}
        {profile.role === "admin" ? <span> (Admin)</span> : null}
      </h1>

      <section className="dashboard__section">
        <div className="dashboard__preferred-location-card">
          <p className="dashboard__preferred-location-name">@{profile.username}</p>
          {profile.displayName?.trim() ? (
            <p className="dashboard__preferred-location-coords">
              Display name: {profile.displayName}
            </p>
          ) : null}
        </div>
      </section>

      <section className="dashboard__section">
        <h2>Listings ({listings.length})</h2>
        {listingQuery.isLoading ? (
          <p className="dashboard__preferred-location-meta">Loading listings…</p>
        ) : listings.length === 0 ? (
          <p className="dashboard__preferred-location-meta">
            This user has no active listings.
          </p>
        ) : (
          <div className="dashboard__section__cards">
            {listings.map((item) => (
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
        )}
      </section>

      <section className="dashboard__section dashboard__wishlist">
        <h2>Wishlist ({wishlist.length})</h2>
        {wishlistQuery.isLoading ? (
          <p className="dashboard__preferred-location-meta">Loading wishlist…</p>
        ) : wishlist.length === 0 ? (
          <p className="dashboard__preferred-location-meta">
            This user has no cards on their wishlist.
          </p>
        ) : null}
        {wishlist.length > 0 ? (
          <div className="dashboard__section__cards dashboard__wishlist__cards">
            {wishlist.map((item) => (
              <WishlistItem
                key={item._id}
                card={item.card}
                item={item}
                owner={user}
              />
            ))}
          </div>
        ) : null}
      </section>
    </Fragment>
  );
};
