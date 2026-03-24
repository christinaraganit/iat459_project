export const createNewMeetup = async (listingId, buyer, date, token) => {
  const location = "To be decided"; // You can modify this to accept a location parameter
  console.log("Creating meetup with data:", { listingId, buyer, date });
  const res = await fetch(`http://localhost:5000/api/meetup/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ listingId, buyer, location, date }),
  });

  if (!res.ok) {
    throw new Error("Failed to create meetup");
  }

  return res.json();
};
