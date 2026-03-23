import { useParams } from "react-router";
import { Fragment, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingByID, deleteListingByID } from "../../api/listings";
import TCGdex from "@tcgdex/sdk";
import { Navigate, redirect } from "react-router";
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
  const [card, setCard] = useState();
  const [validListing, setValidListing] = useState(false);
  const [activeOwner, setActiveOwner] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [listingsOfInterest, setListingsOfInterest] = useState([]);
  const [currentUserIsInterested, setCurrentUserIsInterested] = useState(false);

  const listingOfInterestQuery = useQuery({
    queryKey: ["listingsOfInterest"],
    queryFn: async () => {
      if (token) {
        const interests = await getListingsOfInterest(token);
        setListingsOfInterest(interests);
        if (interests.some((listing) => listing._id === cardId)) {
          setCurrentUserIsInterested(true);
        }
        return interests;
      }
      return [];
    },
  });

  const listingQuery = useQuery({
    queryKey: ["listings", cardId],
    queryFn: async () => {
      const listing = await getListingByID(cardId);
      if (listing) setValidListing(true);
      const card = await tcgdex.card.get(listing.cardId);
      console.log(card);
      setCard(card);
      setActiveOwner(listing.seller && listing.seller.username !== null);
      return { ...listing, card };
    },
  });

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
        <p>Price: ${listingQuery.data?.price.toFixed(2)}</p>
        {activeOwner ? (
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
