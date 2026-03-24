import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import TCGdex from "@tcgdex/sdk";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMeetupById } from "../../api/meetup";

export const Meetup = () => {
  const navigate = useNavigate();
  const { role, user, token } = useAuthContext();
  const tcgdex = new TCGdex("en");
  const { meetupId } = useParams();

  const meetupQuery = useQuery({
    queryKey: ["meetup", meetupId],
    queryFn: async () => {
      const meetup = await getMeetupById(meetupId, token);
      if (!meetup) return null;
      const card = await tcgdex.card.get(meetup.cardId);
      return { ...meetup, card };
    },
  });

  return (
    <div>
      <h1>Meetup {meetupId}</h1>
      {meetupQuery.data ? (
        <div>
          <h2>{meetupQuery.data.card.name}</h2>
          <p>
            Seller:{" "}
            {meetupQuery.data.seller.displayName ||
              meetupQuery.data.seller.username}
          </p>
          <p>
            Buyer:{" "}
            {meetupQuery.data.buyer.displayName ||
              meetupQuery.data.buyer.username}
          </p>
          <p>Status: {meetupQuery.data.status}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
