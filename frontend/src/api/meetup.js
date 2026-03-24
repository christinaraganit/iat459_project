export const createNewMeetup = async (listingId, date, token) => {
  const res = await fetch(`http://localhost:5000/api/meetup/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ listingId, date }),
  });

  if (!res.ok) {
    throw new Error("Failed to create meetup");
  }

  return res.json();
};
