import { useEffect, useMemo, useRef, useState } from "react";
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
  getNominatimViewbox,
  isLatLngInBounds,
} from "../../../utils/mapBounds";
import { Button } from "../../Button/Button";
import { Input } from "../../Input/Input";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const NOMINATIM_HEADERS = {
  Accept: "application/json",
  "User-Agent": "IAT459-TCG-Meetup/1.0 (student project; contact via repo)",
};

const NOMINATIM_SEARCH_LIMIT = 10;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_LOCATION_ZOOM = 12;
const RESET_LOCATION_ZOOM = 13;
const SEARCH_LOCATION_ZOOM = 15;
const DEFAULT_LOCATION_LABEL = "Vancouver, BC";

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
  const [selectedLocationLabel, setSelectedLocationLabel] = useState(
    DEFAULT_LOCATION_LABEL,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingLabel, setIsResolvingLabel] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recenterRequest, setRecenterRequest] = useState(0);
  const [recenterZoom, setRecenterZoom] = useState(null);
  const labelRequestIdRef = useRef(0);

  const markerPosition = useMemo(
    () => ({ lat: location.lat, lng: location.lng }),
    [location.lat, location.lng],
  );

  const resolveLocaleLabel = async (lat, lng, fallbackLabel) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat,
        )}&lon=${encodeURIComponent(lng)}`,
        {
          headers: NOMINATIM_HEADERS,
        },
      );

      if (!response.ok) {
        return fallbackLabel;
      }

      const data = await response.json();
      const address = data?.address || {};
      const locality =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.suburb ||
        address.county;

      if (!locality) {
        return fallbackLabel;
      }

      return `${locality}, BC`;
    } catch (_error) {
      return fallbackLabel;
    }
  };

  const setPickedLocation = async (latlng, options = {}) => {
    const boundedLocation = clampLatLngToBC(latlng);
    const fallbackLabel = options.fallbackLabel || DEFAULT_LOCATION_LABEL;

    setLocation({
      lat: Number(boundedLocation.lat.toFixed(6)),
      lng: Number(boundedLocation.lng.toFixed(6)),
    });

    if (options.label) {
      labelRequestIdRef.current += 1;
      setSelectedLocationLabel(options.label);
      setIsResolvingLabel(false);
    } else if (options.resolveLocaleLabel) {
      const requestId = labelRequestIdRef.current + 1;
      labelRequestIdRef.current = requestId;
      setIsResolvingLabel(true);

      const resolvedLabel = await resolveLocaleLabel(
        boundedLocation.lat,
        boundedLocation.lng,
        fallbackLabel,
      );

      if (labelRequestIdRef.current === requestId) {
        setSelectedLocationLabel(resolvedLabel);
        setIsResolvingLabel(false);
      }
    } else {
      setSelectedLocationLabel(fallbackLabel);
    }

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
        label: selectedLocationLabel || DEFAULT_LOCATION_LABEL,
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
    setSearchSuggestions([]);
    setIsSearching(true);

    try {
      const viewbox = getNominatimViewbox();
      const params = new URLSearchParams({
        format: "jsonv2",
        limit: String(NOMINATIM_SEARCH_LIMIT),
        q: query,
        countrycodes: "ca",
        bounded: "1",
        viewbox,
      });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: NOMINATIM_HEADERS },
      );

      if (!response.ok) {
        throw new Error("Address search failed.");
      }

      const results = await response.json();
      if (!results.length) {
        throw new Error("No matching address found.");
      }

      const mapped = results.map((item, index) => ({
        placeId: item.place_id ?? `idx-${index}`,
        lat: Number(item.lat),
        lng: Number(item.lon),
        displayName: item.display_name || query,
      }));

      const inBounds = mapped.filter(
        (row) =>
          !Number.isNaN(row.lat) &&
          !Number.isNaN(row.lng) &&
          isLatLngInBounds({ lat: row.lat, lng: row.lng }),
      );

      if (!inBounds.length) {
        setLocationError(
          "No matches in the allowed map area. Try a more specific name or address.",
        );
        return;
      }

      setSearchSuggestions(inBounds);
    } catch (error) {
      setLocationError(error.message || "Unable to search for that place.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePickSuggestion = (suggestion) => {
    setSearchSuggestions([]);
    setLocationError("");
    setPickedLocation(
      { lat: suggestion.lat, lng: suggestion.lng },
      {
        zoom: SEARCH_LOCATION_ZOOM,
        label: suggestion.displayName,
        fallbackLabel: DEFAULT_LOCATION_LABEL,
      },
    );
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
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setSearchSuggestions([]);
          }}
          placeholder="Search an address"
        />
        <Button
          variant="secondary"
          className="onboarding__search-button"
          type="button"
          onClick={handleLocationSearch}
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>
      {searchSuggestions.length > 0 ? (
        <ul
          className="onboarding__location-suggestions"
          aria-label="Location search results"
        >
          {searchSuggestions.map((suggestion) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                className="onboarding__location-suggestion"
                onClick={() => handlePickSuggestion(suggestion)}
              >
                {suggestion.displayName.length > 120
                  ? `${suggestion.displayName.slice(0, 117)}…`
                  : suggestion.displayName}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {locationError ? (
        <p className="onboarding__location-error">{locationError}</p>
      ) : null}
      <div className="onboarding__location-actions">
        <Button
          variant="tertiary"
          className="onboarding__reset-location"
          type="button"
          onClick={() =>
            setPickedLocation(VANCOUVER_CENTER, {
              zoom: RESET_LOCATION_ZOOM,
              label: DEFAULT_LOCATION_LABEL,
            })
          }
        >
          Reset location
        </Button>
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
        <MapClickHandler
          onPick={(latlng) =>
            setPickedLocation(latlng, {
              resolveLocaleLabel: true,
              fallbackLabel: DEFAULT_LOCATION_LABEL,
            })
          }
        />
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
              setPickedLocation(event.target.getLatLng(), {
                resolveLocaleLabel: true,
                fallbackLabel: DEFAULT_LOCATION_LABEL,
              });
            },
          }}
        >
          <Popup>Your preferred location</Popup>
        </Marker>
      </MapContainer>
      {isResolvingLabel ? <p>Updating location label...</p> : null}
      <p className="onboarding__location-coords">
        Selected coordinates: {location.lat}, {location.lng}
      </p>
      <div className="onboarding__buttons">
        <Button
          variant="secondary"
          className="onboarding__back"
          type="button"
          onClick={decrementStep}
        >
          Back
        </Button>
        <Button
          variant="primary"
          className="onboarding__save-location"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save location"}
        </Button>
      </div>
    </form>
  );
};
