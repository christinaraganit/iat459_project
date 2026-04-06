import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { EllipsisVertical } from "lucide-react";
import "./ReviewCard.css";

export const ReviewCard = ({ review, onEdit, onDelete, subtitle = "" }) => {
  const { user: currentUser, role } = useAuthContext();
  const reviewer = review.reviewer;
  const displayName = reviewer?.displayName?.trim() || reviewer?.username;
  const canManage = currentUser?.id === reviewer?._id || role === "admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const formattedDate = new Date(review.createdAt).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" },
  );

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(review);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(review);
  };

  return (
    <div className="dashboard__preferred-location-card">
      <div className="review-card__header">
        <div className="review-card__avatar"></div>
        <div className="review-card__user-info">
          <p className="review-card__display-name">
            {displayName}
            {reviewer?.displayName?.trim() ? `@${reviewer.username}` : null}
          </p>
          {subtitle ? <p className="review-card__subtitle">{subtitle}</p> : null}
          <p className="review-card__date">{formattedDate}</p>
        </div>
        {canManage ? (
          <div className="review-card__menu-wrap" ref={menuRef}>
            <button
              className="review-card__menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              type="button"
            >
              <EllipsisVertical size={18} />
            </button>
            {menuOpen ? (
              <div className="review-card__dropdown">
                <button type="button" onClick={handleEdit}>Edit</button>
                <button
                  type="button"
                  className="review-card__delete"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="review-card__stars">
        {"★".repeat(review.score)}
        {"☆".repeat(5 - review.score)}
      </p>
      {review.comment ? (
        <p className="review-card__comment">{review.comment}</p>
      ) : null}
    </div>
  );
};
