import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { getPreferredLocation } from "../../../api/account";
import { BC_BOUNDS, VANCOUVER_CENTER } from "../../../utils/mapBounds";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Button } from "../../Button/Button";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 12000,
  },
  card: {
    width: "min(92vw, 760px)",
    background: "#fff",
    borderRadius: "12px",
    padding: "1rem",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  map: {
    width: "100%",
    height: "280px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #ddd",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginTop: "1rem",
  },
  error: {
    color: "#a11",
    marginTop: "0.5rem",
  },
};

const defaultDateTimeLocal = () => {
  const nextHour = new Date();
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  return nextHour.toISOString().slice(0, 16);
};

const getMapDataFromPreferredLocation = (preferredLocation) => {
  const fallback = {
    position: [VANCOUVER_CENTER.lat, VANCOUVER_CENTER.lng],
    label: "Seller preferred location",
    isValid: false,
  };

  if (!preferredLocation) return fallback;

  if (
    Array.isArray(preferredLocation.coordinates) &&
    preferredLocation.coordinates.length === 2 &&
    typeof preferredLocation.coordinates[0] === "number" &&
    typeof preferredLocation.coordinates[1] === "number"
  ) {
    const lat = preferredLocation.coordinates[1];
    const lng = preferredLocation.coordinates[0];
    return {
      position: [lat, lng],
      label: preferredLocation.label?.trim() || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      isValid: true,
    };
  }

  return fallback;
};

export const CreateMeetupModal = ({
  isOpen,
  token,
  buyer,
  listingId,
  isSubmitting,
  onClose,
  onCreate,
}) => {
  const [dateTime, setDateTime] = useState(defaultDateTimeLocal);

  const preferredLocationQuery = useQuery({
    queryKey: ["preferredLocation", token],
    queryFn: async () => {
      if (!token) return null;
      return getPreferredLocation(token);
    },
    enabled: isOpen,
  });

  const mapData = useMemo(
    () => getMapDataFromPreferredLocation(preferredLocationQuery.data),
    [preferredLocationQuery.data],
  );

  if (!isOpen) {
    return null;
  }

  const hasPreferredLocation = mapData.isValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasPreferredLocation) {
      return;
    }

    onCreate({
      listingId,
      buyer: buyer._id,
      date: new Date(dateTime),
      location: {
        type: "Point",
        coordinates: [mapData.position[1], mapData.position[0]],
        label: mapData.label,
      },
    });
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.card} onClick={(e) => e.stopPropagation()}>
        <h3>Create Meetup with {buyer.displayName || buyer.username}</h3>
        <p>Meetup location is based on your saved preferred location.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Date and time
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </label>

          <div style={modalStyles.row}>
            <strong>Location:</strong>
            <span>{mapData.label}</span>
          </div>

          <div style={modalStyles.map}>
            <MapContainer
              center={mapData.position}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
              maxBounds={BC_BOUNDS}
              maxBoundsViscosity={1.0}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={mapData.position}>
                <Popup>{mapData.label}</Popup>
              </Marker>
            </MapContainer>
          </div>

          {!hasPreferredLocation && (
            <p style={modalStyles.error}>
              Please set your preferred location in Dashboard before creating a meetup.
            </p>
          )}

          <div style={modalStyles.row}>
            <Button
              variant="secondary"
              className="create-meetup__cancel"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="create-meetup__submit"
              type="submit"
              disabled={isSubmitting || preferredLocationQuery.isLoading || !hasPreferredLocation}
            >
              {isSubmitting ? "Creating..." : "Create Meetup"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
