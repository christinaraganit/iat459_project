import { useParams } from "react-router";
import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getListingsFromUser } from "../../api/listings";
import { getWishlist } from "../../api/wishlist";
import { getReviewsForUser } from "../../api/reviews";
import { WishlistItem } from "../../components/Dashboard/NameField/WishlistItem/WishlistItem";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import TCGdex from "@tcgdex/sdk";
import { getUser } from "../../api/account";
import { useAuthContext } from "../../context/AuthContext";
import { SubmitReview } from "../../components/SubmitReview/SubmitReview";
import { DeleteReviewDialog } from "../../components/DeleteReviewDialog/DeleteReviewDialog";
import { Button } from "../../components/Button/Button";
import { ReviewCard } from "../../components/ReviewCard/ReviewCard";
import "../Dashboard/Dashboard.css";

export const User = () => {
  const tcgdex = new TCGdex("en");
  const { user } = useParams();
  const { user: currentUser, token } = useAuthContext();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);

  const userQuery = useQuery({
    queryKey: ["username", user],
    queryFn: () => getUser(user),
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

  const reviewsQuery = useQuery({
    queryKey: ["reviews", user],
    queryFn: () => getReviewsForUser(user),
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
  const reviews = reviewsQuery.data ?? [];
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
      : null;
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

      <section className="dashboard__section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{margin: 0}}>Reviews ({reviews.length})</h2>
          {token && currentUser?.username !== profile.username ? (
            <Button
              variant="primary"
              onClick={() => { setEditingReview(null); setReviewDialogOpen(true); }}
            >
              Submit Review
            </Button>
          ) : null}
        </div>
        {reviewsQuery.isLoading ? (
          <p className="dashboard__preferred-location-meta">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="dashboard__preferred-location-meta">
            This user has no reviews yet.
          </p>
        ) : (
          <>
            <div className="dashboard__preferred-location-card">
              <p className="dashboard__preferred-location-name" style={{ color: "#facc15" }}>
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
                onEdit={(r) => { setEditingReview(r); setReviewDialogOpen(true); }}
                onDelete={(r) => setDeletingReview(r)}
              />
            ))}
          </>
        )}
      </section>

      <SubmitReview
        revieweeId={profile._id}
        revieweeUsername={profile.username}
        open={reviewDialogOpen}
        onClose={() => { setReviewDialogOpen(false); setEditingReview(null); }}
        review={editingReview}
      />
      <DeleteReviewDialog
        review={deletingReview}
        revieweeUsername={profile.username}
        open={Boolean(deletingReview)}
        onClose={() => setDeletingReview(null)}
      />
    </Fragment>
  );
};
