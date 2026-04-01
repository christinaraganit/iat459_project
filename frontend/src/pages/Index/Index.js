import { Fragment, useState } from "react";
import TCGdex from "@tcgdex/sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getListings } from "../../api/listings";
import ListingCard from "../../components/Listing/ListingCard/ListingCard";
import "./Index.css";
import ConditionFilter from "../../components/Condition/ConditionFilter";
import { useGridColumns } from "../../hooks/useGridColumns";
import { useAuthContext } from "../../context/AuthContext";
import { getMyMeetups, updateMeetupStatus } from "../../api/meetup";
import { Button } from "../../components/Button/Button";
import { LinkButton } from "../../components/LinkButton/LinkButton";
import { ChevronDown } from "lucide-react";
import { queryClient } from "../../App";

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
        (listings ?? []).map(async (listing) => {
          try {
            return await tcgdex.card.get(listing.cardId);
          } catch (err) {
            console.error("Failed to load card from tcgdex:", listing.cardId, err);
            return null;
          }
        }),
      );
      console.log(listings);
      return listings.map((listing, i) => ({
        ...listing,
        card: cards[i] ?? null,
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

  const updateMeetupStatusMutation = useMutation({
    mutationFn: ({ meetupId, status }) =>
      updateMeetupStatus(meetupId, status, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meetups"],
      });
    },
  });

  const sortedMeetups = [...(meetupsQuery.data || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const currentPageListingsCount = listingsQuery.data?.length ?? 0;
  const disableNextPage =
    listingsQuery.isPending ||
    currentPageListingsCount === 0 ||
    currentPageListingsCount < count;

  return (
    <Fragment>
      <div className="listing__nav">
        <div className="listings__container">
          <h1>Listings near you</h1>
          <div className="listing__controls">
            <div className="listing__dropdown-control listing__dropdown-control--select">
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
              <ChevronDown className="listing__dropdown-chevron" size={16} />
            </div>
            <Button
              variant="secondary"
              className={
                order === "asc"
                  ? "listing__control-button is-active"
                  : "listing__control-button"
              }
              onClick={() => setOrder("asc")}
            >
              Asc
            </Button>
            <Button
              variant="secondary"
              className={
                order === "desc"
                  ? "listing__control-button is-active"
                  : "listing__control-button"
              }
              onClick={() => setOrder("desc")}
            >
              Desc
            </Button>
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
          <Button
            variant="secondary"
            className="listing__pagination__previous"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            variant="secondary"
            className="listing__pagination__next"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={disableNextPage}
          >
            Next
          </Button>
        </div>
      </div>
      {user && (
        <section className="meetups__container">
          <h2>Upcoming meetups</h2>
          {sortedMeetups.length === 0 ? (
            <p>You currently have no upcoming meetups</p>
          ) : null}
          {sortedMeetups.map((meetup, i) => (
            <LinkButton
              key={`meetup-${i}`}
              to={`/meetups/${meetup._id}`}
              variant="secondary"
              className="index__meetup-link"
            >
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
                  {meetup.status === "pending" && (
                    <Button
                      variant="primary"
                      className="dashboard__accept-meetup"
                      onClick={() =>
                        updateMeetupStatusMutation.mutate({
                          meetupId: meetup._id,
                          status: "accepted",
                        })
                      }
                    >
                      Accept meetup
                    </Button>
                  )}
                </p>
              ) : null}
            </LinkButton>
          ))}
        </section>
      )}
    </Fragment>
  );
};
