export const getNewUserState = async (token) => {
  try {
    const res = await fetch(`http://localhost:5000/api/account/isNewUser`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });
    const data = await res.json();
    if (res.ok) return data;
    else {
      throw new Error("Failed to fetch new user state");
    }
  } catch (er) {
    console.error("Failed to retrieve new user state:", er);
  }
};

export const getDisplayName = async (token) => {
  try {
    const res = await fetch(`http://localhost:5000/api/account/displayName`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });
    const data = await res.json();
    console.log("Display name:", data);
    return data;
  } catch (er) {
    console.error("Failed to retrieve display name:", er);
  }
};

export const getUser = async (username) => {
  const res = await fetch(
    `http://localhost:5000/api/account/user/${username}`,
    {
      method: "GET",
    },
  );
  const data = await res.json();

  return data;
};

export const addListingOfInterest = async (token, listingId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/account/interest/${listingId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      },
    );
    const data = await res.json();
    console.log("Add listing of interest response:", data);
  } catch (er) {
    console.error("Failed to add listing of interest:", er);
  }
};

export const removeListingOfInterest = async (token, listingId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/account/interest/${listingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      },
    );
    const data = await res.json();
    console.log("Remove listing of interest response:", data);
  } catch (er) {
    console.error("Failed to remove listing of interest:", er);
  }
};

export const getListingsOfInterest = async (token) => {
  try {
    const res = await fetch(`http://localhost:5000/api/account/interest`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });
    const data = await res.json();
    console.log("Listings of interest:", data);
    return data;
  } catch (er) {
    console.error("Failed to retrieve listings of interest:", er);
  }
};
