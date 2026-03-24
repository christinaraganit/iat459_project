import "./Dashboard.css";
import { Fragment, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import TCGdex from "@tcgdex/sdk";
import {
  addCardToWishlist,
  getWishlist,
  removeCardFromWishlist,
} from "../../api/wishlist";
import { getListingsFromCurrentUser } from "../../api/listings";
import { getListingsOfInterest } from "../../api/account";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../App";
import { Onboarding } from "../../components/Onboarding/Onboarding";
import { NameField } from "../../components/Dashboard/NameField/NameField";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const Dashboard = () => {
  const tcgdex = new TCGdex("en");
  const { token, user, isNewUser, role } = useAuthContext();

  const [fieldname, setFieldname] = useState("");

  // Wishlist fetch
  // Maps the saved card ids to the actual card from tcgdex
  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user, token],
    queryFn: async () => {
      if (!user || !token) return [];
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
      const cards = await Promise.all(
        listings?.map((listing) => tcgdex.card.get(listing.cardId)),
      );
      return listings.map((listing, i) => ({
        ...listing,
        card: cards[i],
      }));
    },
  });

  const listingsOfInterestQuery = useQuery({
    queryKey: ["listingsOfInterest", token],
    queryFn: async () => {
      if (token) {
        const interests = await getListingsOfInterest(token);
        const cards = await Promise.all(
          interests?.map((interest) => tcgdex.card.get(interest.cardId)),
        );
        return interests.map((interest, i) => ({
          ...interest,
          card: cards[i],
        }));
      }
      return [];
    },
  });

  return (
    <Fragment>
      <h1>Dashboard</h1>

      <p>
        Welcome <NameField /> {role === "admin" && <span>(Admin)</span>}
      </p>

      <section className="dashboard__section">
        <h2>My preferred meeting location</h2>
        <div
          style={{
            height: "800px",
          }}
        >
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[51.505, -0.09]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </section>

      <section className="dashboard__section dashboard__wishlist">
        <h2>My wishlist ({wishlistQuery.data?.length || 0})</h2>
        <div className="dashboard__section__cards dashboard__wishlist__cards">
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
        <div className="dashboard__section__cards dashboard__offers__cards">
          {listingsQuery.data?.map((listing, i) => (
            <Link to={`/listings/${listing._id}`} key={`offers-card-${i}`}>
              <img
                key={`offers-card-${i}`}
                src={listing.card?.image + "/low.webp"}
                alt={listing.card?.name}
                style={{
                  cursor: "pointer",
                }}
              />
            </Link>
          ))}
        </div>
        <Link to="/dashboard/create">Create new offer</Link>
      </section>
      <section className="dashboard__section dashboard__listings_of_interest">
        <h2>
          Listings of interest ({listingsOfInterestQuery.data?.length || 0})
        </h2>
        <div className="dashboard__section__cards dashboard__listings_of_interest__cards">
          {listingsOfInterestQuery.data?.map((listing, i) => (
            <Link to={`/listings/${listing._id}`} key={`offers-card-${i}`}>
              <img
                key={`offers-card-${i}`}
                src={listing.card?.image + "/low.webp"}
                alt={listing.card?.name}
                style={{
                  cursor: "pointer",
                }}
              />
            </Link>
          ))}
        </div>
      </section>
      {isNewUser && <Onboarding />}
    </Fragment>
  );
};
