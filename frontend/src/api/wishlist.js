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
    console.log("Wishlist:", data);
    return data;
  } catch (er) {
    console.error("Failed to retrieve wishlist:", er);
  }
};

export const addCardToWishlist = async (user, token, cardId) => {
  if (cardId === "") {
    alert("Please enter a card ID");
    return;
  }
  try {
    const res = await fetch(
      `http://localhost:5000/api/wishlist/${user?.username}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ cardId }),
      },
    );
    const data = await res.json();
    console.log("Add to wishlist response:", data);
  } catch (er) {
    console.error("Failed to add card to wishlist:", er);
  }
};

export const removeCardFromWishlist = async (user, token, index) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/wishlist/${user?.username}/${index}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ index }),
      },
    );
    const data = await res.json();
    console.log("Remove from wishlist response:", data);
  } catch (er) {
    console.error("Failed to remove card from wishlist:", er);
  }
};
