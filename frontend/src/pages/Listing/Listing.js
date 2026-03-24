import { useParams } from "react-router";
import { Fragment, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getListingByID, deleteListingByID } from "../../api/listings";
import TCGdex from "@tcgdex/sdk";
import { useNavigate, Link } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import {
  addListingOfInterest,
  removeListingOfInterest,
  getListingsOfInterest,
} from "../../api/account";
import { queryClient } from "../../App";

export const Listing = () => {
  const navigate = useNavigate();
  const { role, user, token } = useAuthContext();
  const tcgdex = new TCGdex("en");
  const { cardId } = useParams();
  const [deleted, setDeleted] = useState(false);

  const listingQuery = useQuery({
    queryKey: ["listings", cardId],
    queryFn: async () => {
      const listing = await getListingByID(cardId);
      if (!listing) return null;

      const card = await tcgdex.card.get(listing.cardId);
      return { ...listing, card };
    },
  });

  const currentUserIsInterested = useQuery({
    queryKey: ["listingsOfInterest", token],
    queryFn: async () => {
      if (token) {
        const interests = await getListingsOfInterest(token);
        console.log(interests);
        return interests?.some((interest) => interest._id === cardId);
      }
      return false;
    },
  });

  const card = listingQuery.data?.card;
  const validListing = Boolean(listingQuery.data);
  const activeOwner = Boolean(listingQuery.data?.seller?.username);

  const deleteListingMutation = useMutation({
    mutationFn: (id) => deleteListingByID(id, token),
    onSuccess: () => {
      setDeleted(true);
      queryClient.invalidateQueries({
        queryKey: ["listings"],
      });
    },
    onError: (err) => {
      console.error(err);
      alert("Failed to delete listing");
    },
  });

  const sendInterestMutation = useMutation({
    mutationFn: (listingId) => addListingOfInterest(token, listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listingsOfInterest"],
      });
    },
    onError: (err) => {
      console.error(err);
      alert("Failed to send interest");
    },
  });

  const revokeInterestMutation = useMutation({
    mutationFn: (listingId) => removeListingOfInterest(token, listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listingsOfInterest"],
      });
      navigate("/");
    },
    onError: (err) => {
      console.error(err);
      alert("Failed to revoke interest");
    },
  });

  const handleDelete = () => {
    deleteListingMutation.mutate(listingQuery.data?._id);
  };

  const handleSendInterest = () => {
    sendInterestMutation.mutate(listingQuery.data?._id);
  };

  const handleRevokeInterest = () => {
    revokeInterestMutation.mutate(listingQuery.data?._id);
  };

  return listingQuery.isPending ? (
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
        (currentUserIsInterested.data ? (
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
