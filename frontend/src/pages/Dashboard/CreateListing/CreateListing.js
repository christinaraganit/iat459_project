import "./CreateListing.css";
import { useState, useEffect, useRef } from "react";
import { Query } from "@tcgdex/sdk";
import { useAuthContext } from "../../../context/AuthContext";
import TCGdex from "@tcgdex/sdk";
export const CreateListing = () => {
  const { token } = useAuthContext();
  const tcgdex = new TCGdex("en");
  const [searchQs, setSearchQs] = useState({ results: [], page: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef(null);
  const [listing, setListing] = useState({
    cardId: "",
    price: 0,
    condition: "Mint",
    notes: "",
  });
  // Current listings do not actually choose a card. This is just testing search queries within the API
  useEffect(() => {
    if (searchTerm) {
      const search = async () => {
        const results = await tcgdex.card.list(
          new Query()
            .like("name", searchTerm)
            .not.equal("image", null)
            .paginate(searchQs.page, 5),
        );
        setSearchQs({ ...searchQs, results });
      };
      search();
      console.log("Search results:", searchQs);
    } else {
      setSearchQs({ results: [], page: 1 });
    }
  }, [searchTerm, searchQs.page]);

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
    <div className="create_listing">
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          marginBottom: "20px",
          display: "flex",
          overflowX: "auto",
          gap: "5px",
        }}
      >
        {searchQs.results &&
          searchQs.results.map((card, i) => (
            <div key={card.id}>
              {card.name} {card.id}
              <img
                key={`wishlist-card-${i}`}
                src={card?.image + "/low.webp"}
                alt={card?.name}
                onClick={() => {
                  setListing({ ...listing, cardId: card.id });
                  ref.current.value = card.id;
                }}
                style={{
                  cursor: "pointer",
                }}
              />
            </div>
          ))}
      </div>
      <div>
        <label>
          Search for card
          <input
            type="text"
            onChange={(e) => setSearchTerm(e.target.value)}
          ></input>
        </label>
        <label>
          Page{" "}
          <input
            type="number"
            value={searchQs.page}
            onChange={(e) => setSearchQs({ ...searchQs, page: e.target.value })}
          />
        </label>
        <button
          type="button"
          onClick={() => setSearchQs({ ...searchQs, page: searchQs.page + 1 })}
        >
          ^
        </button>
        <button
          type="button"
          onClick={() => setSearchQs({ ...searchQs, page: searchQs.page - 1 })}
        >
          v
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Card name
          <input
            type="text"
            ref={ref}
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
    </div>
  );
};
