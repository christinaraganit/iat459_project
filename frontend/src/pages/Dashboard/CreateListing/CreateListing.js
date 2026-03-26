import "./CreateListing.css";
import { useState, useEffect, useRef } from "react";
import { Query } from "@tcgdex/sdk";
import { useAuthContext } from "../../../context/AuthContext";
import TCGdex from "@tcgdex/sdk";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addListing } from "../../../api/listings";
import { useGridColumns } from "../../../hooks/useGridColumns";
import { Button } from "../../../components/Button/Button";

export const CreateListing = () => {
  const navigate = useNavigate();
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
  const queryClient = useQueryClient();
  // Current listings do not actually choose a card. This is just testing search queries within the API

  const gridCols = useGridColumns();
  const searchResultsQuery = useQuery({
    queryKey: ["searchResults", searchTerm, searchQs.page, gridCols],
    queryFn: async () => {
      if (searchTerm) {
        const results = await tcgdex.card.list(
          new Query()
            .like("name", searchTerm)
            .not.equal("image", null)
            .paginate(searchQs.page, gridCols),
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
  }, [searchTerm, searchQs.page]);

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
      <h1>Create new listing</h1>
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
        <Button
          variant="secondary"
          className="create_listing__page-up"
          type="button"
          onClick={() => setSearchQs({ ...searchQs, page: searchQs.page + 1 })}
        >
          ^
        </Button>
        <Button
          variant="secondary"
          className="create_listing__page-down"
          type="button"
          onClick={() => setSearchQs({ ...searchQs, page: searchQs.page - 1 })}
        >
          v
        </Button>
      </div>
      <div
        style={{
          border: "1px solid black",
          padding: "10px",
          marginBottom: "20px",
          display: "flex",
          overflowX: "hidden",
          gap: "5px",
        }}
      >
        {searchResultsQuery.data &&
          searchResultsQuery.data.map((card, i) => (
            <div
              key={card.id}
              style={{
                border:
                  listing.cardId === card.id
                    ? "2px solid blue"
                    : "2px solid gray",
                flex: "1 1 0",
                overflowX: "hidden",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                {card.name}
              </h2>
              <p>{card.id}</p>
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

        <Button variant="primary" className="create_listing__submit" type="submit">
          Create Listing
        </Button>
      </form>
    </div>
  );
};
