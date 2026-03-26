import { useParams } from "react-router";
import { Fragment, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getListingByID,
  deleteListingByID,
  getInterestedUsersByListingId,
} from "../../api/listings";
import TCGdex from "@tcgdex/sdk";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import {
  addListingOfInterest,
  removeListingOfInterest,
  getListingsOfInterest,
} from "../../api/account";
import { addInterestedUser, removeInterestedUser } from "../../api/listings";
import {
  createNewMeetup,
  getMeetupsByListingId,
  removeMeetup,
} from "../../api/meetup";
import { queryClient } from "../../App";
import { CreateMeetupModal } from "../../components/Listing/Meetup/CreateMeetup";
import { Button } from "../../components/Button/Button";
import { LinkButton } from "../../components/LinkButton/LinkButton";

export const Listing = () => {
  const navigate = useNavigate();
  const { role, user, token } = useAuthContext();
  const tcgdex = new TCGdex("en");
  const { cardId } = useParams();
  const [activeMeetupBuyer, setActiveMeetupBuyer] = useState(null);

  const listingQuery = useQuery({
    queryKey: ["listings", cardId],
    queryFn: async () => {
      const listing = await getListingByID(cardId);
      if (!listing) return null;

      const card = await tcgdex.card.get(listing.cardId);
      return { ...listing, card };
    },
  });

  const currentUserIsInterested = useQuery({
    queryKey: ["listingsOfInterest", cardId, token],
    queryFn: async () => {
      if (token) {
        const interests = await getListingsOfInterest(token);
        return interests?.some((interest) => interest._id === cardId);
      }
      return false;
    },
  });

  const interestedUsersQuery = useQuery({
    queryKey: ["interestedUsers", cardId, token],
    queryFn: async () => {
      if (cardId) {
        return getInterestedUsersByListingId(cardId);
      }
      return [];
    },
  });

  const card = listingQuery.data?.card;
  const validListing = Boolean(listingQuery.data);
  const activeOwner = Boolean(listingQuery.data?.seller?.username);

  const deleteListingMutation = useMutation({
    mutationFn: (id) => deleteListingByID(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listings"],
      });
      navigate("/");
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const sendInterestMutation = useMutation({
    mutationFn: (listingId) => addListingOfInterest(listingId, token),
    onSuccess: () => {
      addInterestedUserMutation.mutate(listingQuery.data?._id);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const revokeInterestMutation = useMutation({
    mutationFn: (listingId) => removeListingOfInterest(listingId, token),
    onSuccess: () => {
      removeInterestedUserMutation.mutate(listingQuery.data?._id);
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const addInterestedUserMutation = useMutation({
    mutationFn: (listingId) => addInterestedUser(listingId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listingsOfInterest"],
      });
      queryClient.invalidateQueries({
        queryKey: ["interestedUsers", cardId, token],
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const removeInterestedUserMutation = useMutation({
    mutationFn: (listingId) => removeInterestedUser(listingId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listingsOfInterest"],
      });
      queryClient.invalidateQueries({
        queryKey: ["interestedUsers", cardId, token],
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const createMeetupMutation = useMutation({
    mutationFn: ({ listingId, buyer, date, location }) =>
      createNewMeetup(listingId, buyer, date, location, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meetups"],
      });
      setActiveMeetupBuyer(null);
    },
    onError: (err) => {
      console.error(err);
      alert(err.message || "Failed to create meetup");
    },
  });

  const removeMeetupMutation = useMutation({
    mutationFn: ({ listingId, buyer, seller }) =>
      removeMeetup(listingId, buyer, seller, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["meetups"],
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const meetupQuery = useQuery({
    queryKey: ["meetups", cardId, token],
    queryFn: async () => {
      if (cardId) {
        return getMeetupsByListingId(cardId, token);
      }
      return [];
    },
  });

  const handleDelete = () => {
    deleteListingMutation.mutate(listingQuery.data?._id);
  };

  const handleSendInterest = () => {
    sendInterestMutation.mutate(listingQuery.data?._id);
  };

  const handleRevokeInterest = () => {
    revokeInterestMutation.mutate(listingQuery.data?._id);
  };

  return listingQuery.isPending ? (
    <div>Loading listing...</div>
  ) : listingQuery.isError ? (
    <div>invalid listing</div>
  ) : !validListing ? (
    <div>invalid listing</div>
  ) : (
    <div>
      <h1>{card?.name}</h1>
      <p>#{cardId}</p>
      {interestedUsersQuery.data?.length > 0 && (
        <p>
          {interestedUsersQuery.data.length} interested user
          {interestedUsersQuery.data.length !== 1 ? "s" : ""}
        </p>
      )}
      {card && (
        <div>
          <img src={card?.image + "/low.webp"} alt={card.name} />
        </div>
      )}
      <div>
        <p>Condition: {listingQuery.data?.condition}</p>
        <p>Price: ${listingQuery.data?.price?.toFixed(2)}</p>
        {activeOwner ? (
          <LinkButton
            to={`/user/${listingQuery.data?.seller.username}`}
            variant="tertiary"
            className="listing__seller-link"
          >
            Seller:{" "}
            {listingQuery.data?.seller.displayName ? (
              <span>{listingQuery.data?.seller.displayName}</span>
            ) : (
              <span>{listingQuery.data?.seller.username}</span>
            )}
          </LinkButton>
        ) : (
          <p>Seller not found</p>
        )}
      </div>

      {activeOwner &&
        user &&
        listingQuery.data?.seller._id !== user?.id &&
        (currentUserIsInterested.data ? (
          <Fragment>
            <div>Interest sent!</div>
            <Button
              variant="secondary"
              className="listing__revoke-interest"
              onClick={handleRevokeInterest}
            >
              Revoke interest
            </Button>
          </Fragment>
        ) : (
          <Button
            variant="primary"
            className="listing__send-interest"
            onClick={handleSendInterest}
          >
            Send interest
          </Button>
        ))}

      {(role === "admin" ||
        (activeOwner && listingQuery.data?.seller._id === user?.id)) && (
        <Button variant="tertiary" className="listing__delete" onClick={handleDelete}>
          Delete Listing
        </Button>
      )}

      {activeOwner &&
        user &&
        user.id === listingQuery.data?.seller._id &&
        interestedUsersQuery.data?.length > 0 && (
          <div>
            <h3>Interested Users:</h3>
            <ul>
              {interestedUsersQuery.data.map((interestedUser, i) => (
                <li key={`interested-user-${i}`}>
                  <LinkButton
                    to={`/user/${interestedUser.username}`}
                    variant="tertiary"
                    className="listing__interested-user-link"
                  >
                    {interestedUser.displayName || interestedUser.username}
                    <span>@{interestedUser.username}</span>
                  </LinkButton>
                  {meetupQuery.data?.some(
                    (item) => item.buyer._id === interestedUser._id,
                  ) ? (
                    <Button
                      variant="secondary"
                      className="listing__revoke-meetup"
                      onClick={() =>
                        removeMeetupMutation.mutate({
                          listingId: listingQuery.data?._id,
                          buyer: interestedUser._id,
                          seller: listingQuery.data?.seller._id,
                        })
                      }
                    >
                      Revoke meetup
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="listing__create-meetup"
                      onClick={() => setActiveMeetupBuyer(interestedUser)}
                    >
                      Create Meetup
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

      <CreateMeetupModal
        isOpen={Boolean(activeMeetupBuyer)}
        token={token}
        buyer={activeMeetupBuyer}
        listingId={listingQuery.data?._id}
        isSubmitting={createMeetupMutation.isPending}
        onClose={() => setActiveMeetupBuyer(null)}
        onCreate={(payload) => createMeetupMutation.mutate(payload)}
      />
    </div>
  );
};
