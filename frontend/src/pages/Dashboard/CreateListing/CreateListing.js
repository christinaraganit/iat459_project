import "./CreateListing.css";
import { useState, useEffect, useRef } from "react";
import { Query } from "@tcgdex/sdk";
import { useAuthContext } from "../../../context/AuthContext";
import TCGdex from "@tcgdex/sdk";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addListing } from "../../../api/listings";

export const CreateListing = () => {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const tcgdex = new TCGdex("en");
  const [searchQs, setSearchQs] = useState({ results: [], page: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [finished, setFinished] = useState(false);
  const ref = useRef(null);
  const [listing, setListing] = useState({
    cardId: "",
    price: 0,
    condition: "Mint",
    notes: "",
  });
  const queryClient = useQueryClient();
  // Current listings do not actually choose a card. This is just testing search queries within the API

  const searchResultsQuery = useQuery({
    queryKey: ["searchResults", searchTerm, searchQs.page],
    queryFn: async () => {
      if (searchTerm) {
        const results = await tcgdex.card.list(
          new Query()
            .like("name", searchTerm)
            .not.equal("image", null)
            .paginate(searchQs.page, 5),
        );
        return results;
      }
      return [];
    },
    enabled: Boolean(searchTerm),
  });
  useEffect(() => {
    if (!searchTerm) {
      setSearchQs({ results: [], page: 1 });
    }
  }, [searchTerm]);

  const addListingMutation = useMutation({
    mutationFn: (listing) => addListing(listing, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      navigate("/dashboard");
    },
    onError: (err) => {
      console.error("Failed to create listing:", err);
      alert("Failed to create listing");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting listing:", listing);
    addListingMutation.mutate(listing);
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
        {searchResultsQuery.data &&
          searchResultsQuery.data.map((card, i) => (
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
