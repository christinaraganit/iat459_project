import { useEffect } from "react";
import {
  updateWishlistItemStatus,
  removeCardFromWishlist,
} from "../../../../api/wishlist";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../../context/AuthContext";
import { Button } from "../../../Button/Button";

export const WishlistItem = ({ card, item, owner }) => {
  const { token, user } = useAuthContext();
  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      return await updateWishlistItemStatus(item._id, newStatus, token);
    },
    onSuccess: (data) => {
      console.log("Wishlist item status updated:", data);
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },
    onError: (err) => {
      console.error("Failed to update wishlist item status:", err);
    },
  });
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (id) => {
      return await removeCardFromWishlist(id, token);
    },
    onSuccess: (data) => {
      console.log("Wishlist item removed:", data);
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
      });
    },
  });
  return (
    <div className="wishlist-item" style={{ position: "relative" }}>
      <img src={card?.image + "/low.webp"} alt={card?.name} />
      {item.status === "seeking" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "0.5rem",
            cursor: "pointer",
            borderRadius: "0 0 0.5rem 0",
          }}
          onClick={() => {
            updateStatusMutation.mutate("owned");
          }}
        >
          Seeking
        </div>
      )}
      {item.status === "owned" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "rgba(58, 165, 19, 0.7)",
            color: "white",
            padding: "0.5rem",
            cursor: "pointer",
            borderRadius: "0 0 0.5rem 0",
          }}
          onClick={() => {
            updateStatusMutation.mutate("seeking");
          }}
        >
          Owned
        </div>
      )}
      {owner === user?.username && (
        <Button
          variant="tertiary"
          className="wishlist-item__remove"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "rgba(255, 0, 0, 0.7)",
            color: "white",
            border: "none",
            padding: "0.5rem",
            cursor: "pointer",
          }}
          onClick={() => removeFromWishlistMutation.mutate(item._id)}
        >
          Remove
        </Button>
      )}
    </div>
  );
};
