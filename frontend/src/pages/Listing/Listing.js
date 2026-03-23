import { useParams } from "react-router";
import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingByID, deleteListingByID } from "../../api/listings";
import TCGdex from "@tcgdex/sdk";
import { Navigate, Link } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import {
  addListingOfInterest,
  removeListingOfInterest,
  getListingsOfInterest,
} from "../../api/account";

export const Listing = () => {
  const { role, user, token } = useAuthContext();
  const tcgdex = new TCGdex("en");
  const { cardId } = useParams();
  const [deleted, setDeleted] = useState(false);
  const [currentUserIsInterested, setCurrentUserIsInterested] = useState(false);

  const listingQuery = useQuery({
    queryKey: ["listings", cardId],
    queryFn: async () => {
      const listing = await getListingByID(cardId);
      if (!listing) return null;

      const card = await tcgdex.card.get(listing.cardId);
      return { ...listing, card };
    },
  });

  useQuery({
    queryKey: ["listingsOfInterest", token],
    queryFn: async () => {
      if (token) {
        const interests = await getListingsOfInterest(token);
        setCurrentUserIsInterested(
          interests.some((listing) => listing._id === cardId),
        );
        return interests;
      }

      setCurrentUserIsInterested(false);
      return [];
    },
  });

  const card = listingQuery.data?.card;
  const validListing = Boolean(listingQuery.data);
  const activeOwner = Boolean(listingQuery.data?.seller?.username);

  const handleDelete = () => {
    deleteListingByID(listingQuery.data?._id, token).then(() => {
      setDeleted(true);
    });
  };

  const handleSendInterest = () => {
    addListingOfInterest(token, listingQuery.data?._id);
    setCurrentUserIsInterested(true);
  };

  const handleRevokeInterest = () => {
    removeListingOfInterest(token, listingQuery.data?._id);
    setCurrentUserIsInterested(false);
  };

  return deleted ? (
    <Navigate to="/" />
  ) : listingQuery.isPending ? (
    <div>Loading listing...</div>
  ) : listingQuery.isError ? (
    <div>invalid listing</div>
  ) : !validListing ? (
    <div>invalid listing</div>
  ) : (
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
        <p>Price: ${listingQuery.data?.price?.toFixed(2)}</p>
        {activeOwner ? (
          <Link to={`/user/${listingQuery.data?.seller.username}`}>
            Seller:{" "}
            {listingQuery.data?.seller.displayName ? (
              <span>{listingQuery.data?.seller.displayName}</span>
            ) : (
              <span>{listingQuery.data?.seller.username}</span>
            )}
          </Link>
        ) : (
          <p>Seller not found</p>
        )}
      </div>
      {activeOwner &&
        user &&
        listingQuery.data?.seller._id !== user?.id &&
        (currentUserIsInterested ? (
          <Fragment>
            <div>Interest sent!</div>
            <button onClick={handleRevokeInterest}>Revoke interest</button>
          </Fragment>
        ) : (
          <button onClick={handleSendInterest}>Send interest</button>
        ))}
      {(role === "admin" ||
        (activeOwner && listingQuery.data?.seller._id === user?.id)) && (
        <button onClick={handleDelete}>Delete Listing</button>
      )}
    </div>
  );
};
