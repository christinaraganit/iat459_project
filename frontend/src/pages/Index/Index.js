import { Fragment, useState } from "react";
import TCGdex from "@tcgdex/sdk";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "../../api/listings";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import "./Index.css";
import ConditionFilter from "../../components/Condition/ConditionFilter";
import { useGridColumns } from "../../hooks/useGridColumns";
import { useAuthContext } from "../../context/AuthContext";
import { getMyMeetups } from "../../api/meetup";
import { Link } from "react-router-dom";

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

  const [search] = useState("");
  const [order, setOrder] = useState("desc");
  const [sort, setSort] = useState("createdAt");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const count = useGridColumns();
  const { user, token } = useAuthContext();
  // Listings fetch
  // Maps the saved cards ids to the card from tcgdex
  const listingsQuery = useQuery({
    queryKey: ["listings", search, order, sort, selected, page, count],
    queryFn: async () => {
      const listings = await getListings(
        search,
        sort,
        order,
        selected,
        page,
        count,
      );
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

  const meetupsQuery = useQuery({
    queryKey: ["meetups", user],
    queryFn: async () => {
      if (user) {
        const meetups = await getMyMeetups(token);
        console.log(meetups);
        return meetups;
      }
      return [];
    },
  });

  const sortedMeetups = [...(meetupsQuery.data || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  return (
    <Fragment>
      <div className="listing__nav">
        <h1>Listings near you</h1>
        <div className="listing__controls">
          <select
            className="listing__sort-select"
            value={sort}
            onChange={handleSortChange}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            className={
              order === "asc"
                ? "listing__control-button is-active"
                : "listing__control-button"
            }
            onClick={() => setOrder("asc")}
          >
            Asc
          </button>
          <button
            className={
              order === "desc"
                ? "listing__control-button is-active"
                : "listing__control-button"
            }
            onClick={() => setOrder("desc")}
          >
            Desc
          </button>
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
      {user && (
        <section>
          <h2>Upcoming meetups</h2>
          {sortedMeetups.map((meetup, i) => (
            <Link key={`meetup-${i}`} to={`/meetups/${meetup._id}`}>
              {meetup.seller._id === user.id ? (
                <p>
                  <span>Selling to</span>{" "}
                  {meetup.buyer.displayName || meetup.buyer.username} for
                  listing {meetup.listingId.cardId} on{" "}
                  {new Date(meetup.date).toLocaleString()} - Status:{" "}
                  {meetup.status}{" "}
                </p>
              ) : meetup.buyer._id === user.id ? (
                <p>
                  <span>Buying from</span>{" "}
                  {meetup.seller.displayName || meetup.seller.username} for
                  listing {meetup.listingId.cardId} on{" "}
                  {new Date(meetup.date).toLocaleString()} - Status:{" "}
                  {meetup.status}{" "}
                </p>
              ) : null}
            </Link>
          ))}
        </section>
      )}
    </Fragment>
  );
};
