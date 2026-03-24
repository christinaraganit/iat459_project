import { useEffect } from "react";
import {
  updateWishlistItemStatus,
  removeCardFromWishlist,
} from "../../../../api/wishlist";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "../../../../context/AuthContext";

export const WishlistItem = ({ card, item }) => {
  const { token } = useAuthContext();
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
      <img
        src={card?.image + "/low.webp"}
        alt={card?.name}
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          removeFromWishlistMutation.mutate(item._id);
        }}
      />
      {item.status === "seeking" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "0.5rem",
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
            background: "rgba(96, 255, 38, 0.5)",
            color: "white",
            padding: "0.5rem",
          }}
          onClick={() => {
            updateStatusMutation.mutate("seeking");
          }}
        >
          Owned
        </div>
      )}
    </div>
  );
};
