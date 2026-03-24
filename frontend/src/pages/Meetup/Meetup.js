import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import TCGdex from "@tcgdex/sdk";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMeetupById, updateMeetupStatus } from "../../api/meetup";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Fragment } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  BC_BOUNDS,
  VANCOUVER_CENTER,
  clampLatLngToBC,
} from "../../utils/mapBounds";

const parseCoordinateLocation = (locationValue) => {
  if (typeof locationValue !== "string") return null;

  const match = locationValue
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);

  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

  return { lat, lng };
};

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

  const meetupStatusMutation = useMutation({
    mutationFn: async (status) => {
      await updateMeetupStatus(meetupId, status, token);
    },
    onSuccess: () => {
      meetupQuery.refetch();
    },
  });

  const parsedMeetupLocation = parseCoordinateLocation(
    meetupQuery.data?.location,
  );
  const boundedMeetupLocation = parsedMeetupLocation
    ? clampLatLngToBC(parsedMeetupLocation)
    : VANCOUVER_CENTER;
  const mapPosition = [boundedMeetupLocation.lat, boundedMeetupLocation.lng];
  const mapLabel = meetupQuery.data?.location || "Meetup location";

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
          <p>Location: {meetupQuery.data.location}</p>
          <div>
            {meetupQuery.data.seller._id === user.id ? (
              <Fragment>
                <button
                  onClick={() => meetupStatusMutation.mutate("completed")}
                >
                  Mark as completed
                </button>
                <button
                  onClick={() => meetupStatusMutation.mutate("cancelled")}
                >
                  Cancel meetup
                </button>
              </Fragment>
            ) : null}
          </div>
          <div
            style={{
              height: "80vh",
            }}
          >
            <MapContainer
              key={`${mapPosition[0]}-${mapPosition[1]}`}
              center={mapPosition}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
              maxBounds={BC_BOUNDS}
              maxBoundsViscosity={1.0}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapPosition}>
                <Popup>{mapLabel}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
