import { useState, useEffect } from "react";
export const CreateListing = ({ username, token }) => {
  const [listing, setListing] = useState({
    cardId: "",
    seller: username,
    price: 0,
    condition: "Mint",
    notes: "",
  });

  const addListing = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/listings/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(listing),
      });
      const data = await res.json();
      console.log("Add to listing response:", data);
    } catch (er) {
      console.error("Failed to add listing to db:", er);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting listing:", listing);
    addListing();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Card name
        <input
          type="text"
          onChange={(e) => setListing({ ...listing, cardId: e.target.value })}
        ></input>
      </label>

      <label>
        Price
        <input
          type="number"
          onChange={(e) => setListing({ ...listing, price: e.target.value })}
        ></input>
      </label>
      <label>
        Condition
        <select
          onChange={(e) =>
            setListing({ ...listing, condition: e.target.value })
          }
        >
          <option value="Mint">Mint</option>
          <option value="Lightly Played">Lightly Played</option>
          <option value="Played">Played</option>
        </select>
      </label>
      <label>
        Notes
        <textarea
          onChange={(e) => setListing({ ...listing, notes: e.target.value })}
        ></textarea>
      </label>
      <button type="submit">Create Listing</button>
    </form>
  );
};
