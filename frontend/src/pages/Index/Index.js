import { Fragment, useState } from "react";
import TCGdex from "@tcgdex/sdk";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "../../api/listings";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import "./Index.css";
import ConditionFilter from "../../components/Condition/ConditionFilter";

const options = [
  {
    value: "createdAt",
    label: "Created At",
  },
  {
    value: "price",
    label: "Price",
  },
  {
    value: "condition",
    label: "Condition",
  },
];

export const Index = () => {
  const tcgdex = new TCGdex("en");

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("desc");
  const [sort, setSort] = useState("createdAt");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  // Listings fetch
  // Maps the saved cards ids to the card from tcgdex
  const listingsQuery = useQuery({
    queryKey: ["listings", search, order, sort, selected, page],
    queryFn: async () => {
      const listings = await getListings(search, sort, order, selected, page);
      const cards = await Promise.all(
        listings?.map((listing) => tcgdex.card.get(listing.cardId)),
      );
      console.log(listings);
      return listings.map((listing, i) => ({
        ...listing,
        card: cards[i],
      }));
    },
  });

  const handleSortChange = (ev) => {
    setSort(ev.target.value);
  };

  return (
    <Fragment>
      <div className="listing__nav">
        <h1>Listings near you</h1>
        <div>
          <select value={sort} onChange={handleSortChange}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button onClick={() => setOrder("asc")}>Asc</button>
          <button onClick={() => setOrder("desc")}>Desc</button>
          <ConditionFilter selected={selected} setSelected={setSelected} />
        </div>
      </div>
      <div className="listing__list">
        {listingsQuery.data?.map((item) => (
          <ListingCard
            key={item._id}
            seller={item.seller}
            price={item.price}
            condition={item.condition}
            image={item.card?.getImageURL("low")}
            cardId={item.card?.id}
            cardName={item.card?.name}
            id={item._id}
          />
        ))}
      </div>
      <div className="listing__pagination">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
      </div>
    </Fragment>
  );
};
