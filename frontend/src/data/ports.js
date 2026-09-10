// Stylized chart position (0–100, 0–100) for every port that appears in
// routes.csv. Positions are loosely relative to real geography so lanes
// read correctly on the plotter, but this is an illustrative chart, not
// a navigational one.

export const PORT_COORDS = {
  Vancouver: { x: 8, y: 22 },
  "Los Angeles": { x: 10, y: 38 },
  "Long Beach": { x: 11, y: 39.5 },
  "New York": { x: 24, y: 29 },

  London: { x: 43, y: 18 },
  Felixstowe: { x: 45, y: 17 },
  Rotterdam: { x: 47, y: 17 },
  Antwerp: { x: 47, y: 19 },
  Hamburg: { x: 49, y: 15 },
  Genoa: { x: 48, y: 26 },
  Barcelona: { x: 45, y: 27 },
  Piraeus: { x: 53, y: 28 },

  Dubai: { x: 60, y: 36 },
  Mumbai: { x: 63, y: 42 },
  Kochi: { x: 64, y: 49 },
  Chennai: { x: 66, y: 46 },
  Colombo: { x: 65, y: 51 },

  Singapore: { x: 72, y: 54 },
  "Hong Kong": { x: 76, y: 41 },
  Shanghai: { x: 78, y: 34 },
  Ningbo: { x: 79, y: 35.5 },
  Busan: { x: 81, y: 31 },
  Tokyo: { x: 85, y: 31 },
  Yokohama: { x: 85, y: 32.5 },

  "Cape Town": { x: 50, y: 71 },
  Durban: { x: 55, y: 67 },

  Melbourne: { x: 85, y: 77 },
  Sydney: { x: 88, y: 74 },
};

export const ORIGIN_PORTS = [
  "Antwerp", "Barcelona", "Busan", "Cape Town", "Chennai", "Colombo",
  "Dubai", "Durban", "Genoa", "Hamburg", "Hong Kong", "Kochi", "London",
  "Long Beach", "Los Angeles", "Melbourne", "Mumbai", "Ningbo", "Piraeus",
  "Rotterdam", "Shanghai", "Singapore", "Sydney", "Vancouver",
];

export const DEST_PORTS = [
  "Antwerp", "Barcelona", "Busan", "Cape Town", "Dubai", "Durban",
  "Felixstowe", "Genoa", "Hamburg", "London", "Long Beach", "Los Angeles",
  "Melbourne", "New York", "Piraeus", "Rotterdam", "Shanghai", "Singapore",
  "Sydney", "Tokyo", "Yokohama",
];

export const CARGO_TYPES = [
  "General Cargo", "Containerized Cargo", "Reefer / Perishable",
  "Bulk Cargo", "Liquid Bulk", "Hazardous (IMDG)",
];