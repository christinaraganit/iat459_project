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
