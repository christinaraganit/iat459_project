export const getWishlist = async (user, token) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/wishlist/${user?.username}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      },
    );
    const data = await res.json();
    return data;
  } catch (er) {
    console.error("Failed to retrieve wishlist:", er);
  }
};

export const addCardToWishlist = async (cardId, token) => {
  if (cardId === "") {
    alert("Please enter a card ID");
    return;
  }
  try {
    const res = await fetch(`http://localhost:5000/api/wishlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ cardId }),
    });
    const data = await res.json();
    return data;
    // console.log("Add to wishlist response:", data);
  } catch (er) {
    console.error("Failed to add card to wishlist:", er);
  }
};

export const removeCardFromWishlist = async (id, token) => {
  console.log("Removing wishlist item with ID:", id);
  try {
    const res = await fetch(`http://localhost:5000/api/wishlist/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    return data;
    // console.log("Remove from wishlist response:", data);
  } catch (er) {
    console.error("Failed to remove card from wishlist:", er);
  }
};

export const updateWishlistItemStatus = async (
  wishlistItemId,
  status,
  token,
) => {
  try {
    console.log(`Updating wishlist item ${wishlistItemId} status to ${status}`);
    const res = await fetch(`http://localhost:5000/api/wishlist/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ wishlistItemId, status }),
    });
    const data = await res.json();
    return data;
    // console.log("Update wishlist item status response:", data);
  } catch (er) {
    console.error("Failed to update wishlist item status:", er);
  }
};
