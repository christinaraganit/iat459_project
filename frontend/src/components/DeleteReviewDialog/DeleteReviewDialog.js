import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../context/AuthContext";
import { deleteReview } from "../../api/reviews";
import { Button } from "../Button/Button";
import "../SubmitReview/SubmitReview.css";
import "../ReviewCard/ReviewCard.css";

export const DeleteReviewDialog = ({ review, revieweeUsername, open, onClose }) => {
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  const backdropRef = useRef(null);

  const mutation = useMutation({
    mutationFn: () => deleteReview(review._id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", revieweeUsername] });
      onClose();
    },
  });

  if (!open || !review) return null;

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const reviewer = review.reviewer;
  const displayName = reviewer?.displayName?.trim() || reviewer?.username;
  const formattedDate = new Date(review.createdAt).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <div
      className="review-dialog__backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="review-dialog">
        <h2>Delete Review</h2>
        <p style={{ margin: "0 0 0.75rem", color: "#555" }}>
          Are you sure you want to delete this review? This action cannot be undone.
        </p>

        <div className="dashboard__preferred-location-card">
          <div className="review-card__header">
            <div className="review-card__avatar"></div>
            <div className="review-card__user-info">
              <p className="review-card__display-name">
                {displayName}
                {reviewer?.displayName?.trim() ? `@${reviewer.username}` : null}
              </p>
              <p className="review-card__date">{formattedDate}</p>
            </div>
          </div>
          <p className="review-card__stars">
            {"★".repeat(review.score)}
            {"☆".repeat(5 - review.score)}
          </p>
          {review.comment ? (
            <p className="review-card__comment">{review.comment}</p>
          ) : null}
        </div>

        {mutation.isError ? (
          <p style={{ color: "#dc2626", margin: "0.5rem 0 0" }}>
            {mutation.error?.message}
          </p>
        ) : null}

        <div className="review-dialog__actions">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
};
