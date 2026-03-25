export const createNewMeetup = async (listingId, buyer, date, location, token) => {
  console.log("Creating meetup with data:", { listingId, buyer, date, location });
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

export const removeMeetup = async (listingId, buyer, seller, token) => {
  const res = await fetch(
    `http://localhost:5000/api/meetup/byListing/${listingId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ buyer, seller }),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to remove meetup");
  }

  return res.json();
};

export const getMeetupById = async (meetupId, token) => {
  const res = await fetch(`http://localhost:5000/api/meetup/byId/${meetupId}`, {
    headers: {
      Authorization: token,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch meetup");
  }

  return res.json();
};

export const getMeetupsByListingId = async (listingId, token) => {
  const res = await fetch(
    `http://localhost:5000/api/meetup/byListing/${listingId}`,
    {
      headers: {
        Authorization: token,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch meetups");
  }

  return res.json();
};

export const updateMeetupStatus = async (meetupId, status, token) => {
  const res = await fetch(`http://localhost:5000/api/meetup/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ meetupId, status }),
  });
  if (!res.ok) {
    throw new Error("Failed to update meetup status");
  }
  return res.json();
};

export const getMyMeetups = async (token) => {
  const res = await fetch(`http://localhost:5000/api/meetup/myMeetups`, {
    headers: {
      Authorization: token,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch meetups");
  }
  return res.json();
};
