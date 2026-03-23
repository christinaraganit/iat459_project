export const getListings = async (
  search = "",
  sort = "createdAt",
  order = "desc",
  filter = [],
) => {
  const params = new URLSearchParams();
  if (search) {
    params.append("search", search);
  }
  if (sort) {
    params.append("sort", sort);
  }
  if (order) {
    params.append("order", order);
  }

  if (filter.length > 0) {
    filter.forEach((condition) => params.append("condition", condition));
  }
  console.log(params.toString());
  const res = await fetch(
    `http://localhost:5000/api/listings?${params.toString()}`,
  );
  // const res = await fetch(`http://localhost:5000/api/listings/`);

  if (!res.ok) {
    throw new Error("Failed to fetch listings");
  }

  return res.json();
};

export const getListingsById = async (id = "") => {
  const params = new URLSearchParams();
  if (id) {
    params.append("id", id);
  }

  const res = await fetch(
    `http://localhost:5000/api/listings?${params.toString()}`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch listings");
  }

  return res.json();
};

export const getListingsFromUser = async (user = "") => {
  const params = new URLSearchParams();
  if (user) {
    params.append("user", user);
  }

  console.log(params);

  const res = await fetch(`http://localhost:5000/api/listings/user/${user}`);

  if (!res.ok) {
    throw new Error("Failed to fetch listings");
  }

  return res.json();
};

export const getListingByID = async (id = "") => {
  const params = new URLSearchParams();
  if (id) {
    params.append("id", id);
  }

  const res = await fetch(`http://localhost:5000/api/listings/item/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch listing");
  }

  return res.json();
};

export const getListingsFromCurrentUser = async (token) => {
  const res = await fetch(`http://localhost:5000/api/listings/currentUser`, {
    headers: {
      Authorization: token,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch listings for current user");
  }

  return res.json();
};
