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
