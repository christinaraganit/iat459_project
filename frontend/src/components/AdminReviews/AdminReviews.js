import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "../../context/AuthContext";
import { getAllReviews } from "../../api/reviews";
import { ReviewCard } from "../ReviewCard/ReviewCard";
import { SubmitReview } from "../SubmitReview/SubmitReview";
import { DeleteReviewDialog } from "../DeleteReviewDialog/DeleteReviewDialog";
import { Button } from "../Button/Button";
import "./AdminReviews.css";

export const AdminReviews = () => {
  const { token, role } = useAuthContext();
  const [showAll, setShowAll] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const reviewsQuery = useQuery({
    queryKey: ["allReviews", token],
    queryFn: () => getAllReviews(token),
    enabled: Boolean(token && role === "admin"),
  });

  const reviews = reviewsQuery.data ?? [];
  const visibleReviews = useMemo(
    () => (showAll ? reviews : reviews.slice(0, 5)),
    [reviews, showAll],
  );

  if (role !== "admin") return null;

  return (
    <section className="dashboard__section">
      <h2>Recently posted reviews</h2>
      {reviewsQuery.isLoading ? (
        <p className="dashboard__preferred-location-meta">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="dashboard__preferred-location-meta">
          There are no reviews yet.
        </p>
      ) : (
        <>
          {visibleReviews.map((review) => {
            const reviewee = review.reviewee;
            const revieweeName =
              reviewee?.displayName?.trim() || reviewee?.username || "Unknown user";

            return (
              <ReviewCard
                key={review._id}
                review={review}
                subtitle={`Review for ${revieweeName}`}
                onEdit={(r) => {
                  setEditingReview(r);
                  setReviewDialogOpen(true);
                }}
                onDelete={(r) => setDeletingReview(r)}
              />
            );
          })}

          {reviews.length > 5 ? (
            <div className="admin-reviews__footer">
              <Button
                variant="primary"
                className="admin-reviews__toggle"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "Collapse reviews" : "View all reviews"}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <SubmitReview
        revieweeId={editingReview?.reviewee?._id}
        revieweeUsername={editingReview?.reviewee?.username}
        open={reviewDialogOpen}
        onClose={() => {
          setReviewDialogOpen(false);
          setEditingReview(null);
        }}
        review={editingReview}
      />
      <DeleteReviewDialog
        review={deletingReview}
        revieweeUsername={deletingReview?.reviewee?.username}
        open={Boolean(deletingReview)}
        onClose={() => setDeletingReview(null)}
      />
    </section>
  );
};
