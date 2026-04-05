/** Leaflet maxBounds: [[south, west], [north, east]] as [lat, lng] pairs */
export const BC_BOUNDS = [
  [49.0, -123.6],
  [50.0, -121.2],
];

export const VANCOUVER_CENTER = {
  lat: 49.2827,
  lng: -123.1207,
};

export const clampLatLngToBC = ({ lat, lng }) => ({
  lat: Math.min(Math.max(lat, BC_BOUNDS[0][0]), BC_BOUNDS[1][0]),
  lng: Math.min(Math.max(lng, BC_BOUNDS[0][1]), BC_BOUNDS[1][1]),
});

/**
 * True if the point lies inside BC_BOUNDS without clamping (same box as the map).
 */
export const isLatLngInBounds = ({ lat, lng }) => {
  const south = BC_BOUNDS[0][0];
  const west = BC_BOUNDS[0][1];
  const north = BC_BOUNDS[1][0];
  const east = BC_BOUNDS[1][1];
  return lat >= south && lat <= north && lng >= west && lng <= east;
};

/**
 * Nominatim viewbox: west longitude, north latitude, east longitude, south latitude.
 */
export const getNominatimViewbox = () => {
  const south = BC_BOUNDS[0][0];
  const west = BC_BOUNDS[0][1];
  const north = BC_BOUNDS[1][0];
  const east = BC_BOUNDS[1][1];
  return `${west},${north},${east},${south}`;
};
