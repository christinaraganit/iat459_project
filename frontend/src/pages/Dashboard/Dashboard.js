import "./Dashboard.css";
import { Fragment, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { CreateListing } from "../../components/Dashboard/CreateListing/CreateListing";
import TCGdex from "@tcgdex/sdk";
import {
  addCardToWishlist,
  getWishlist,
  removeCardFromWishlist,
} from "../../api/wishlist";
import { getListingsFromCurrentUser } from "../../api/listings";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../App";
import { Onboarding } from "../../components/Onboarding/Onboarding";
import { NameField } from "../../components/Dashboard/NameField/NameField";

export const Dashboard = () => {
  const tcgdex = new TCGdex("en");
  const { token, user, isNewUser, role } = useAuthContext();

  const [fieldname, setFieldname] = useState("");

  // Wishlist fetch
  // Maps the saved card ids to the actual card from tcgdex
  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user, token],
    queryFn: async () => {
      const data = await getWishlist(user, token);
      return await Promise.all(data?.map((card) => tcgdex.card.get(card)));
    },
  });

  // Function to remove card from wishlist
  // Make the query refetch the data on success
  const removeWishlistCardMutation = useMutation({
    mutationFn: (index) => removeCardFromWishlist(user, token, index),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const [newListingOpen, setNewListingOpen] = useState(false);

  // Function add card to wishlist
  // Make query refetch the data on success
  const addWishlistCardMutation = useMutation({
    mutationFn: async (cardId) => {
      const card = await tcgdex.card.get(cardId);
      if (!card) {
        alert("Card not found");
        return;
      }
      return addCardToWishlist(user, token, cardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  // const wishlistQuery = useQuery({
  //   queryKey: ["wishlist", user, token],
  //   queryFn: async () => {
  //     const data = await getWishlist(user, token);
  //     return await Promise.all(data?.map((card) => tcgdex.card.get(card)));
  //   },
  // });

  const listingsQuery = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const listings = await getListingsFromCurrentUser(token);
      return await Promise.all(
        listings?.map((listing) => tcgdex.card.get(listing.cardId)),
      );
    },
  });

  return (
    <Fragment>
      <h1>Dashboard</h1>

      <p>
        Welcome <NameField /> {role === "admin" && <span>(Admin)</span>}
      </p>

      <section className="dashboard__section dashboard__wishlist">
        <h2>My wishlist ({wishlistQuery.data?.length || 0})</h2>
        <div className="dashboard__wishlist__cards">
          {wishlistQuery.data?.map((card, i) => (
            <img
              key={`wishlist-card-${i}`}
              src={card?.image + "/low.webp"}
              alt={card?.name}
              onClick={() => removeWishlistCardMutation.mutate(i)}
              style={{
                cursor: "pointer",
              }}
            />
          ))}
        </div>
        <input
          type="text"
          value={fieldname}
          onChange={(e) => setFieldname(e.target.value)}
        />
        <button onClick={() => addWishlistCardMutation.mutate(fieldname)}>
          Add card by ID
        </button>
        <button onClick={() => removeWishlistCardMutation.mutate(0)}>
          Delete card
        </button>
      </section>
      <section className="dashboard__section dashboard__offers">
        <h2>My offers ({listingsQuery.data?.length || 0})</h2>
        <div className="dashboard__offers__cards">
          {listingsQuery.data?.map((card, i) => (
            <img
              key={`offers-card-${i}`}
              src={card?.image + "/low.webp"}
              alt={card?.name}
              style={{
                cursor: "pointer",
              }}
            />
          ))}
        </div>
        {!newListingOpen ? (
          <button onClick={() => setNewListingOpen(true)}>
            Create new offer
          </button>
        ) : (
          <button onClick={() => setNewListingOpen(false)}>Cancel</button>
        )}
        {newListingOpen && (
          <CreateListing
            token={token}
            tcgdex={tcgdex}
            handleClose={() => setNewListingOpen(false)}
          />
        )}
      </section>
      {isNewUser && <Onboarding />}
    </Fragment>
  );
};
