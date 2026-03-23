import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingByID, deleteListingByID } from "../../api/listings";
import TCGdex from "@tcgdex/sdk";
import { Navigate, redirect } from "react-router";
import { useAuthContext } from "../../context/AuthContext";

export const Listing = () => {
  const { role, user, token } = useAuthContext();
  const tcgdex = new TCGdex("en");
  const { cardId } = useParams();
  const [card, setCard] = useState();
  const [validListing, setValidListing] = useState(false);
  const [activeOwner, setActiveOwner] = useState(false);
  const [deleted, setDeleted] = useState(false);

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
      {(role === "admin" || listingQuery.data?.seller._id === user?.id) && (
        <button onClick={handleDelete}>Delete Listing</button>
      )}
    </div>
  );
};
