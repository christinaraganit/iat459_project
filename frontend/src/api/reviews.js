export const submitReview = async (revieweeId, score, comment, token) => {
  const res = await fetch("http://localhost:5000/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({revieweeId, score, comment}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit review");
  return data;
};

export const editReview = async (reviewId, score, comment, token) => {
  const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ score, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to edit review");
  return data;
};

export const deleteReview = async (reviewId, token) => {
  const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete review");
  return data;
};

export const getReviewsForUser = async (username) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/reviews/user/${username}`,
      { method: "GET" },
    );
    return await res.json();
  } catch (er) {
    console.error("Failed to retrieve reviews:", er);
  }
};

export const getAllReviews = async (token) => {
  const res = await fetch("http://localhost:5000/api/reviews", {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch reviews");
  return data;
};
