import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { savePreferredLocation } from "../../../api/account";
import { queryClient } from "../../../App";
import {
  BC_BOUNDS,
  VANCOUVER_CENTER,
  clampLatLngToBC,
} from "../../../utils/mapBounds";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_LOCATION_ZOOM = 12;
const RESET_LOCATION_ZOOM = 13;
const SEARCH_LOCATION_ZOOM = 15;

const MapClickHandler = ({ onPick }) => {
  useMapEvents({
    click(event) {
      onPick(event.latlng);
    },
  });

  return null;
};

const RecenterMap = ({ position, zoom, trigger }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(position, zoom ?? map.getZoom(), {
      animate: true,
    });
  }, [map, position, trigger, zoom]);

  return null;
};

export const LocationSubmission = ({ authContext, decrementStep }) => {
  const { token, activateNewUser } = authContext;
  const [location, setLocation] = useState(VANCOUVER_CENTER);
  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [recenterRequest, setRecenterRequest] = useState(0);
  const [recenterZoom, setRecenterZoom] = useState(null);

  const markerPosition = useMemo(
    () => ({ lat: location.lat, lng: location.lng }),
    [location.lat, location.lng],
  );

  const setPickedLocation = (latlng, options = {}) => {
    const boundedLocation = clampLatLngToBC(latlng);
    setLocation({
      lat: Number(boundedLocation.lat.toFixed(6)),
      lng: Number(boundedLocation.lng.toFixed(6)),
    });
    setRecenterZoom(options.zoom ?? null);
    setRecenterRequest((prev) => prev + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocationError("");
    setIsSaving(true);

    savePreferredLocation(
      {
        lat: location.lat,
        lng: location.lng,
        label: searchValue.trim(),
      },
      token,
    )
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["preferredLocation"],
        });
        activateNewUser();
      })
      .catch((error) => {
        setLocationError(error.message || "Could not save preferred location.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleLocationSearch = async (e) => {
    e.preventDefault();

    const query = searchValue.trim();
    if (!query) {
      return;
    }

    setLocationError("");
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Address search failed.");
      }

      const results = await response.json();
      if (!results.length) {
        throw new Error("No matching address found.");
      }

      const bestMatch = results[0];
      const searchedLocation = {
        lat: Number(bestMatch.lat),
        lng: Number(bestMatch.lon),
      };
      const boundedLocation = clampLatLngToBC(searchedLocation);

      if (
        searchedLocation.lat !== boundedLocation.lat ||
        searchedLocation.lng !== boundedLocation.lng
      ) {
        setLocationError("That address is outside BC. Please search within BC.");
        return;
      }

      setPickedLocation(searchedLocation, { zoom: SEARCH_LOCATION_ZOOM });
    } catch (error) {
      setLocationError(error.message || "Unable to search for that place.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="onboarding__content">
      <h2>Where would you like to organize card pickups?</h2>
      <p>Choose a public place to meet up with other players.</p>
      <p className="onboarding__location-help">
        Click on the map to choose your preferred meetup location, then drag the
        marker to fine tune.
      </p>
      <div className="onboarding__location-search">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search an address"
        />
        <button
          type="button"
          onClick={handleLocationSearch}
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </div>
      {locationError ? (
        <p className="onboarding__location-error">{locationError}</p>
      ) : null}
      <div className="onboarding__location-actions">
        <button
          type="button"
          onClick={() =>
            setPickedLocation(VANCOUVER_CENTER, { zoom: RESET_LOCATION_ZOOM })
          }
        >
          Reset location
        </button>
      </div>
      <MapContainer
        center={VANCOUVER_CENTER}
        zoom={DEFAULT_LOCATION_ZOOM}
        scrollWheelZoom
        className="onboarding__location-map"
        maxBounds={BC_BOUNDS}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={setPickedLocation} />
        <RecenterMap
          position={markerPosition}
          zoom={recenterZoom}
          trigger={recenterRequest}
        />
        <Marker
          draggable
          position={markerPosition}
          eventHandlers={{
            dragend: (event) => {
              setPickedLocation(event.target.getLatLng());
            },
          }}
        >
          <Popup>Your preferred location</Popup>
        </Marker>
      </MapContainer>
      <p className="onboarding__location-coords">
        Selected coordinates: {location.lat}, {location.lng}
      </p>
      <div className="onboarding__buttons">
        <button type="button" onClick={decrementStep}>
          Back
        </button>
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save location"}
        </button>
      </div>
    </form>
  );
};
