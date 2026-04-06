import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../context/AuthContext";
import { submitReview, editReview } from "../../api/reviews";
import { Button } from "../Button/Button";
import "./SubmitReview.css";

export const SubmitReview = ({ revieweeId, revieweeUsername, open, onClose, review }) => {
  const isEditing = Boolean(review);
  const { token } = useAuthContext();
  const queryClient = useQueryClient();
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const backdropRef = useRef(null);

  const mutation = useMutation({
    mutationFn: () =>
      isEditing
        ? editReview(review._id, score, comment, token)
        : submitReview(revieweeId, score, comment, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", revieweeUsername] });
      setScore(0);
      setComment("");
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      mutation.reset();
      setScore(isEditing ? review.score : 0);
      setHovered(0);
      setComment(isEditing ? review.comment || "" : "");
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (score === 0) return;
    mutation.mutate();
  };

  return (
    <div
      className="review-dialog__backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
    >
      <div className="review-dialog">
        <h2>{isEditing ? "Edit Review" : "Leave a Review"}</h2>
        <form onSubmit={handleSubmit} className="review-dialog__form">
          <label>
            Rating
            <div className="review-dialog__stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`review-dialog__star${
                    value <= (hovered || score)
                      ? " review-dialog__star--filled"
                      : ""
                  }`}
                  onClick={() => setScore(value)}
                  onMouseEnter={() => setHovered(value)}
                  onMouseLeave={() => setHovered(0)}
                >
                  ★
                </button>
              ))}
            </div>
          </label>
          <label>
            Comment
            <textarea
              className="review-dialog__comment"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>

          {mutation.isError ? (
            <p style={{ color: "#dc2626", margin: 0 }}>
              {mutation.error?.message}
            </p>
          ) : null}

          <div className="review-dialog__actions">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={score === 0 || mutation.isPending}
            >
              {mutation.isPending
                ? isEditing ? "Saving..." : "Submitting..."
                : isEditing ? "Save Changes" : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
