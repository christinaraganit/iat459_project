export const getListings = async (search = "", sort = "createdAt", order = "desc") => {
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
  
  const res = await fetch (`http://localhost:5000/api/listings?${params.toString()}`);
  
  if (!res.ok) {
    throw new Error ("Failed to fetch listings");
  }
  
  return res.json();
};

