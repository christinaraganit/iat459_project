import "./Dashboard.css";
import { Fragment, useMemo, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import TCGdex from "@tcgdex/sdk";
import {
  addCardToWishlist,
  getWishlist,
  removeCardFromWishlist,
} from "../../api/wishlist";
import { getMyMeetups, updateMeetupStatus } from "../../api/meetup";
import { getListingsFromCurrentUser } from "../../api/listings";
import { getListingsOfInterest, getPreferredLocation } from "../../api/account";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../App";
import { Onboarding } from "../../components/Onboarding/Onboarding";
import { NameField } from "../../components/Dashboard/NameField/NameField";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { WishlistItem } from "../../components/Dashboard/NameField/WishlistItem/WishlistItem";
import {
  BC_BOUNDS,
  VANCOUVER_CENTER,
  clampLatLngToBC,
} from "../../utils/mapBounds";
import { Button } from "../../components/Button/Button";
import { Input } from "../../components/Input/Input";
import { LinkButton } from "../../components/LinkButton/LinkButton";
import { getReviewsForUser } from "../../api/reviews";
import { ReviewCard } from "../../components/ReviewCard/ReviewCard";
import { SubmitReview } from "../../components/SubmitReview/SubmitReview";
import { DeleteReviewDialog } from "../../components/DeleteReviewDialog/DeleteReviewDialog";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const getBoundedPreferredCoords = (preferred) => {
  if (!preferred) return null;

  if (
    Array.isArray(preferred.coordinates) &&
    preferred.coordinates.length === 2 &&
    typeof preferred.coordinates[0] === "number" &&
    typeof preferred.coordinates[1] === "number"
  ) {
    return clampLatLngToBC({
      lat: preferred.coordinates[1],
      lng: preferred.coordinates[0],
    });
  }

  if (
    typeof preferred.lat === "number" &&
    typeof preferred.lng === "number"
  ) {
    return clampLatLngToBC({
      lat: preferred.lat,
      lng: preferred.lng,
    });
  }

  return null;
};

export const Dashboard = () => {
  const tcgdex = new TCGdex("en");
  const { token, user, isNewUser, role } = useAuthContext();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);

  const DEFAULT_MAP_POSITION = [VANCOUVER_CENTER.lat, VANCOUVER_CENTER.lng];

  const [fieldname, setFieldname] = useState("");

  // Wishlist fetch
  // Maps the saved card ids to the actual card from tcgdex
  const wishlistQuery = useQuery({
    queryKey: ["wishlist", user, token],
    queryFn: async () => {
      if (!user || !token) return [];
      const data = await getWishlist(user.username);
      return await Promise.all(
        data?.map(async (item) => ({
          ...item,
          card: await tcgdex.card.get(item.cardId),
        })),
      );
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
      return addCardToWishlist(cardId, token);
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

  const reviewsQuery = useQuery({
    queryKey: ["reviews", user?.username],
    queryFn: () => getReviewsForUser(user.username),
    enabled: Boolean(user?.username),
  });

  const meetupQuery = useQuery({
    queryKey: ["meetups", token],
    queryFn: async () => {
      if (token) {
        const meetups = await getMyMeetups(token);
        console.log("Fetched meetups:", meetups);
        return meetups;
      }
      return [];
    },
  });

  const preferredLocationQuery = useQuery({
    queryKey: ["preferredLocation", token],
    queryFn: async () => {
      if (!token) return null;
      return getPreferredLocation(token);
    },
  });

  const boundedPreferredCoords = useMemo(
    () => getBoundedPreferredCoords(preferredLocationQuery.data),
    [preferredLocationQuery.data],
  );

  const mapPosition = boundedPreferredCoords
    ? [boundedPreferredCoords.lat, boundedPreferredCoords.lng]
    : DEFAULT_MAP_POSITION;

  const mapLabel =
    preferredLocationQuery.data?.label?.trim() ||
    "Your preferred meeting location";

  const preferredLocationCard = useMemo(() => {
    if (!boundedPreferredCoords) return null;
    const rawLabel = preferredLocationQuery.data?.label?.trim();
    const coordText = `${boundedPreferredCoords.lat.toFixed(6)}, ${boundedPreferredCoords.lng.toFixed(6)}`;
    return {
      name: rawLabel || coordText,
      coordinates: coordText,
    };
  }, [boundedPreferredCoords, preferredLocationQuery.data]);

  const updateMeetupStatusMutation = useMutation({
    mutationFn: async ({ meetupId, status }) => {
      const res = await updateMeetupStatus(meetupId, status, token);
      return res;
    },
    onSuccess: (data, variables) => {
      console.log("Meetup status updated:", data);
      queryClient.invalidateQueries({
        queryKey: ["meetups"],
      });
      if (variables?.meetupId) {
        queryClient.invalidateQueries({
          queryKey: ["meetup", variables.meetupId],
        });
      }
    },
  });

  const sortedMeetups = [...(meetupQuery.data || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const reviews = reviewsQuery.data ?? [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <Fragment>
      <h1>
        Welcome <NameField /> {role === "admin" && <span>(Admin)</span>}
      </h1>

      <section className="dashboard__section">
        <h2>My preferred meeting location</h2>
        {preferredLocationQuery.isLoading ? (
          <p className="dashboard__preferred-location-meta">Loading location…</p>
        ) : preferredLocationCard ? (
          <div className="dashboard__preferred-location-card">
            <p className="dashboard__preferred-location-name">
              {preferredLocationCard.name}
            </p>
            <p className="dashboard__preferred-location-coords">
              Coordinates: {preferredLocationCard.coordinates}
            </p>
          </div>
        ) : (
          <p className="dashboard__preferred-location-meta">
            No preferred location saved yet. Complete onboarding to set one.
          </p>
        )}
        <div
          className="dashboard__preferred-location-map-wrap"
          style={{
            height: "80vh",
          }}
        >
          <MapContainer
            key={`${mapPosition[0]}-${mapPosition[1]}`}
            center={mapPosition}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            maxBounds={BC_BOUNDS}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={mapPosition}>
              <Popup>{mapLabel}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </section>
      <section className="dashboard__section">
        <h2>My meetups ({sortedMeetups.length || 0})</h2>
        {sortedMeetups.length === 0 ? (
          <p>You currently have no meetups.</p>
        ) : null}
        {sortedMeetups.map((meetup, i) => (
          <LinkButton
            key={`meetup-${i}`}
            to={`/meetups/${meetup._id}`}
            variant="secondary"
            className="dashboard__meetup-link"
          >
            {meetup.seller._id === user.id ? (
              <p>
                <span>Selling to</span>{" "}
                {meetup.buyer.displayName || meetup.buyer.username} for listing{" "}
                {meetup.listingId.cardId} on{" "}
                {new Date(meetup.date).toLocaleString()} - Status:{" "}
                {meetup.status}{" "}
              </p>
            ) : meetup.buyer._id === user.id ? (
              <p>
                <span>Buying from</span>{" "}
                {meetup.seller.displayName || meetup.seller.username} for
                listing {meetup.listingId.cardId} on{" "}
                {new Date(meetup.date).toLocaleString()} - Status:{" "}
                {meetup.status}{" "}
                {meetup.status === "pending" && (
                  <Button
                    variant="primary"
                    className="dashboard__accept-meetup"
                    onClick={() =>
                      updateMeetupStatusMutation.mutate({
                        meetupId: meetup._id,
                        status: "accepted",
                      })
                    }
                  >
                    Accept meetup
                  </Button>
                )}
              </p>
            ) : null}
          </LinkButton>
        ))}
      </section>

      <section className="dashboard__section dashboard__wishlist">
        <h2>My wishlist ({wishlistQuery.data?.length || 0})</h2>
        {wishlistQuery.data?.length === 0 ? (
          <p>You currently have no cards in your wishlist.</p>
        ) : null}
        <div className="dashboard__section__cards dashboard__wishlist__cards">
          {wishlistQuery.data?.map((item, i) => (
            <WishlistItem
              key={`wishlist-card-${i}`}
              card={item.card}
              item={item}
              owner={user.username}
            />
          ))}
        </div>
        <Input
          type="text"
          value={fieldname}
          onChange={(e) => setFieldname(e.target.value)}
        />
        <Button
          variant="primary"
          className="dashboard__add-wishlist-card"
          onClick={() => addWishlistCardMutation.mutate(fieldname)}
        >
          Add card by ID
        </Button>
        <Button
          variant="tertiary"
          className="dashboard__delete-wishlist-card"
          onClick={() => removeWishlistCardMutation.mutate(0)}
        >
          Delete card
        </Button>
      </section>
      <section className="dashboard__section dashboard__offers">
        <h2>My offers ({listingsQuery.data?.length || 0})</h2>
        {listingsQuery.data?.length === 0 ? (
          <p>You currently have no active offers.</p>
        ) : null}
        <div className="dashboard__section__cards dashboard__offers__cards">
          {listingsQuery.data?.map((listing, i) => (
            <LinkButton
              to={`/listings/${listing._id}`}
              key={`offers-card-${i}`}
              variant="tertiary"
              className="dashboard__offer-link"
            >
              <img
                key={`offers-card-${i}`}
                src={listing.card?.image + "/low.webp"}
                alt={listing.card?.name}
                style={{
                  cursor: "pointer",
                }}
              />
            </LinkButton>
          ))}
        </div>
        <LinkButton
          to="/dashboard/create"
          variant="primary"
          className="dashboard__create-offer-link"
        >
          Create new offer
        </LinkButton>
      </section>
      <section className="dashboard__section dashboard__listings_of_interest">
        <h2>
          Listings of interest ({listingsOfInterestQuery.data?.length || 0})
        </h2>
        {listingsOfInterestQuery.data?.length === 0 ? (
          <p>You currently have no listings of interest.</p>
        ) : null}
        <div className="dashboard__section__cards dashboard__listings_of_interest__cards">
          {listingsOfInterestQuery.data?.map((listing, i) => (
            <LinkButton
              to={`/listings/${listing._id}`}
              key={`offers-card-${i}`}
              variant="tertiary"
              className="dashboard__interest-link"
            >
              <img
                key={`offers-card-${i}`}
                src={listing.card?.image + "/low.webp"}
                alt={listing.card?.name}
                style={{
                  cursor: "pointer",
                }}
              />
            </LinkButton>
          ))}
        </div>
      </section>
      <section className="dashboard__section">
        <h2>My reviews ({reviews.length})</h2>
        {reviewsQuery.isLoading ? (
          <p className="dashboard__preferred-location-meta">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="dashboard__preferred-location-meta">
            You have no reviews yet.
          </p>
        ) : (
          <>
            <div className="dashboard__preferred-location-card">
              <p
                className="dashboard__preferred-location-name"
                style={{ color: "#facc15" }}
              >
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}{" "}
                <span style={{ color: "#111" }}>{averageRating} / 5</span>
              </p>
              <p className="dashboard__preferred-location-coords">
                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onEdit={(r) => {
                  setEditingReview(r);
                  setReviewDialogOpen(true);
                }}
                onDelete={(r) => setDeletingReview(r)}
              />
            ))}
          </>
        )}
      </section>
      {isNewUser && <Onboarding />}
      <SubmitReview
        revieweeId={user?.id}
        revieweeUsername={user?.username}
        open={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false);
          setEditingReview(null);
        }}
        review={editingReview}
      />
      <DeleteReviewDialog
        review={deletingReview}
        revieweeUsername={user?.username}
        open={Boolean(deletingReview)}
        onClose={() => setDeletingReview(null)}
      />
    </Fragment>
  );
};
