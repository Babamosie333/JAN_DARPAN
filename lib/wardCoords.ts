// Approximate real-world coordinates for each ward, used to place markers
// on the Leaflet map. These are locality-level approximations (not surveyed
// municipal ward boundaries) — good enough for pinning a marker on the right
// neighbourhood, not for legal/administrative boundary purposes.
export const WARD_COORDS: Record<string, [number, number]> = {
  kalyanpur: [26.493, 80.238],
  "civil-lines": [26.467, 80.345],
  "swaroop-nagar": [26.479, 80.323],
  "shastri-nagar": [26.475, 80.305],
  kakadeo: [26.474, 80.339],
  "govind-nagar": [26.455, 80.328],
};

export const KANPUR_CENTER: [number, number] = [26.4715, 80.325];
