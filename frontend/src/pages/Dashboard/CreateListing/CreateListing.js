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
import { Input } from "../../../components/Input/Input";
import { ChevronUp, ChevronDown } from "lucide-react";

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
    const safePrice = Math.max(0, Number(listing.price) || 0);
    const listingPayload = { ...listing, price: safePrice };
    console.log("Submitting listing:", listingPayload);
    addListingMutation.mutate(listingPayload);
  };

  const selectCard = (cardId) => {
    setListing({ ...listing, cardId });
    if (ref.current) {
      ref.current.value = cardId;
    }
  };
  const hasSearchTerm = Boolean(searchTerm.trim());
  const searchResultCount = searchResultsQuery.data?.length ?? 0;
  const showSearchPagination = hasSearchTerm && searchResultCount > 0;
  const disableNextSearchPage =
    searchResultsQuery.isPending || searchResultCount < gridCols;

  return (
    <div className="create_listing">
      <section className="create_listing__container">
        <h1>Create new listing</h1>
        <div className="create_listing__controls">
          <label>
            Search for card
            <Input
              type="text"
              placeholder="e.g. Trubbish"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>
      </section>
      <section className="create_listing__container">
        <h2>Card search results</h2>
        <div className="create_listing__search_results">
          {!searchTerm.trim() ? (
            <p className="create_listing__empty_state">
              Start typing a card name to see results.
            </p>
          ) : searchResultsQuery.isPending ? (
            <p className="create_listing__empty_state">Searching cards...</p>
          ) : searchResultsQuery.data?.length === 0 ? (
            <p className="create_listing__empty_state">
              No cards found for that search.
            </p>
          ) : (
            searchResultsQuery.data.map((card, i) => (
              <div
                className={`create_listing__search_card${
                  listing.cardId === card.id ? " is-selected" : ""
                }`}
                key={card.id}
                onClick={() => selectCard(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectCard(card.id);
                  }
                }}
              >
                <h2>{card.name}</h2>
                <p>{card.id}</p>
                <img
                  key={`wishlist-card-${i}`}
                  src={card?.image + "/low.webp"}
                  alt={card?.name}
                />
              </div>
            ))
          )}
        </div>
        {showSearchPagination ? (
          <div className="create_listing__pagination">
            <Button
              variant="secondary"
              className="create_listing__pagination__previous"
              type="button"
              onClick={() =>
                setSearchQs({
                  ...searchQs,
                  page: Math.max(1, Number(searchQs.page) - 1),
                })
              }
              disabled={Number(searchQs.page) <= 1}
            >
              Previous
            </Button>
            <span>Page {searchQs.page}</span>
            <Button
              variant="secondary"
              className="create_listing__pagination__next"
              type="button"
              onClick={() =>
                setSearchQs({ ...searchQs, page: Number(searchQs.page) + 1 })
              }
              disabled={disableNextSearchPage}
            >
              Next
            </Button>
          </div>
        ) : null}
      </section>
      <section className="create_listing__container">
        <h2>Listing details</h2>
        <form onSubmit={handleSubmit} className="create_listing__form">
          <label>
            Card name
            <Input
              type="text"
              ref={ref}
              onChange={(e) =>
                setListing({ ...listing, cardId: e.target.value })
              }
            />
          </label>
          <label>
            Price
            <Input
              type="number"
              min={0}
              value={listing.price}
              onChange={(e) => {
                const nextPrice = Math.max(0, Number(e.target.value) || 0);
                setListing({ ...listing, price: nextPrice });
              }}
            />
          </label>
          <label>
            Condition
            <div className="create_listing__dropdown-control create_listing__dropdown-control--select">
              <select
                className="create_listing__condition-select"
                value={listing.condition}
                onChange={(e) =>
                  setListing({ ...listing, condition: e.target.value })
                }
              >
                <option value="Mint">Mint</option>
                <option value="Lightly Played">Lightly Played</option>
                <option value="Played">Played</option>
              </select>
              <ChevronDown
                className="create_listing__dropdown-chevron"
                size={16}
              />
            </div>
          </label>
          <label>
            Notes
            <textarea
              className="create_listing__notes"
              onChange={(e) =>
                setListing({ ...listing, notes: e.target.value })
              }
            ></textarea>
          </label>

          <Button
            variant="primary"
            className="create_listing__submit"
            type="submit"
          >
            Create Listing
          </Button>
        </form>
      </section>
    </div>
  );
};
