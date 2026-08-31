/**
 * Seeds MongoDB with the original Jan Darpan prototype data
 * (ported verbatim from the old js/data.js) so the Next.js app
 * has real records to render on first run.
 *
 * Run with: npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import Area from "../models/Area";
import Issue from "../models/Issue";

const MONGODB_URI = process.env.MONGODB_URI as string;

const AREAS = [
  {
    id: "kalyanpur", name: "Kalyanpur", city: "Kanpur, Uttar Pradesh",
    score: 84, delta: 6, grid: { row: 1, col: 1 },
    categories: { roads: 78, cleanliness: 91, lighting: 88, water: 84, greenery: 76, traffic: 73, accessibility: 81, services: 86 },
    activeIssues: 3, resolvedThisMonth: 18, citizens: 183, impacted: "47K+",
    trend: [{ month: "May", score: 69 }, { month: "Jun", score: 72 }, { month: "Jul", score: 75 }, { month: "Aug", score: 84 }],
    improvements: ["Main Road pothole repaired", "12 streetlights restored", "Market waste cleared", "Park cleanliness improved"],
    alerts: [{ tone: "blue", text: "Road maintenance scheduled tomorrow near Sector 3." }],
    nearby: { Hospitals: ["Kalyanpur Community Hospital"], Schools: ["St. Xavier's Public School"], "Police Stations": ["Kalyanpur Police Chowki"], "Public Transport": ["Kalyanpur Bus Terminal"] },
  },
  {
    id: "civil-lines", name: "Civil Lines", city: "Kanpur, Uttar Pradesh",
    score: 91, delta: 4, grid: { row: 1, col: 2 },
    categories: { roads: 89, cleanliness: 94, lighting: 92, water: 90, greenery: 88, traffic: 85, accessibility: 90, services: 93 },
    activeIssues: 2, resolvedThisMonth: 21, citizens: 240, impacted: "52K+",
    trend: [{ month: "May", score: 84 }, { month: "Jun", score: 86 }, { month: "Jul", score: 88 }, { month: "Aug", score: 91 }],
    improvements: ["Mall Road footpath resurfaced", "New pedestrian crossing signals installed", "Green cover added along the boulevard"],
    alerts: [],
    nearby: { Hospitals: ["Regency Hospital"], Schools: ["St. Mary's Convent"], "Government Offices": ["District Collectorate"], "Public Transport": ["Civil Lines Metro Station"] },
  },
  {
    id: "swaroop-nagar", name: "Swaroop Nagar", city: "Kanpur, Uttar Pradesh",
    score: 82, delta: 3, grid: { row: 1, col: 3 },
    categories: { roads: 80, cleanliness: 85, lighting: 83, water: 81, greenery: 79, traffic: 76, accessibility: 78, services: 84 },
    activeIssues: 4, resolvedThisMonth: 15, citizens: 156, impacted: "38K+",
    trend: [{ month: "May", score: 74 }, { month: "Jun", score: 77 }, { month: "Jul", score: 79 }, { month: "Aug", score: 82 }],
    improvements: ["Storm drain cleared before monsoon", "New LED streetlights on Kailash Vihar Road"],
    alerts: [{ tone: "orange", text: "Water supply disruption reported in Block C." }],
    nearby: { Hospitals: ["Swaroop Nagar Diagnostic Centre"], Schools: ["Swaroop Nagar Inter College"], "Police Stations": ["Swaroop Nagar Thana"] },
  },
  {
    id: "shastri-nagar", name: "Shastri Nagar", city: "Kanpur, Uttar Pradesh",
    score: 79, delta: 9, grid: { row: 2, col: 1 },
    categories: { roads: 74, cleanliness: 80, lighting: 77, water: 79, greenery: 70, traffic: 71, accessibility: 75, services: 82 },
    activeIssues: 5, resolvedThisMonth: 22, citizens: 201, impacted: "41K+",
    trend: [{ month: "May", score: 64 }, { month: "Jun", score: 69 }, { month: "Jul", score: 73 }, { month: "Aug", score: 79 }],
    improvements: ["Community park benches repaired", "8 streetlights restored on 80 Feet Road", "Weekly waste pickup restored to schedule"],
    alerts: [],
    nearby: { Hospitals: ["Shastri Nagar Primary Health Centre"], Schools: ["Kendriya Vidyalaya Shastri Nagar"], "Public Transport": ["Shastri Nagar Bus Stand"] },
  },
  {
    id: "kakadeo", name: "Kakadeo", city: "Kanpur, Uttar Pradesh",
    score: 68, delta: 2, grid: { row: 2, col: 2 },
    categories: { roads: 64, cleanliness: 70, lighting: 66, water: 69, greenery: 58, traffic: 60, accessibility: 64, services: 71 },
    activeIssues: 8, resolvedThisMonth: 11, citizens: 134, impacted: "33K+",
    trend: [{ month: "May", score: 63 }, { month: "Jun", score: 64 }, { month: "Jul", score: 66 }, { month: "Aug", score: 68 }],
    improvements: ["Market square drainage cleared"],
    alerts: [{ tone: "orange", text: "Waste collection delay reported near the market." }],
    nearby: { Hospitals: ["Kakadeo Nursing Home"], Schools: ["Kakadeo Public School"], "Police Stations": ["Kakadeo Chowki"] },
  },
  {
    id: "govind-nagar", name: "Govind Nagar", city: "Kanpur, Uttar Pradesh",
    score: 61, delta: -1, grid: { row: 2, col: 3 },
    categories: { roads: 55, cleanliness: 62, lighting: 57, water: 63, greenery: 50, traffic: 54, accessibility: 58, services: 66 },
    activeIssues: 11, resolvedThisMonth: 9, citizens: 98, impacted: "29K+",
    trend: [{ month: "May", score: 60 }, { month: "Jun", score: 59 }, { month: "Jul", score: 60 }, { month: "Aug", score: 61 }],
    improvements: ["Streetlight repair crew assigned to Block 4"],
    alerts: [
      { tone: "red", text: "Water supply disruption reported across three blocks." },
      { tone: "orange", text: "Road maintenance backlog under review." },
    ],
    nearby: { Hospitals: ["Govind Nagar Government Dispensary"], Schools: ["Govind Nagar Inter College"], "Fire Stations": ["Govind Nagar Fire Post"] },
  },
];

// Original status values (verified/assigned/progress) collapse onto the new
// STATUS_VALUES enum: reported | in-progress | resolved | rejected.
function mapStatus(oldStatus: string, resolved: boolean) {
  if (resolved) return "resolved";
  if (oldStatus === "reported") return "reported";
  return "in-progress"; // verified / assigned / progress all become in-progress
}

const ISSUES = [
  { title: "Dangerous Pothole", category: "roads", areaId: "kalyanpur", location: "Main Road", confirms: 27, priority: 91, oldStatus: "verified", resolved: false, severity: "High", affected: "My Neighbourhood", description: "A deep pothole has formed near the Main Road junction, causing two-wheelers to swerve into oncoming traffic, especially after dark.", photo: "/assets/issues/pothole.jpg" },
  { title: "Waste Accumulation", category: "cleanliness", areaId: "kalyanpur", location: "Near School", confirms: 14, priority: 72, oldStatus: "reported", resolved: false, severity: "Moderate", affected: "My Street", description: "Garbage has been piling up near the school gate for the past week, past the scheduled collection day.", photo: "/assets/issues/waste.jpg" },
  { title: "Streetlight Failure", category: "lighting", areaId: "kalyanpur", location: "Sector 4", confirms: 8, priority: 63, oldStatus: "assigned", resolved: false, severity: "Moderate", affected: "My Street", description: "Three consecutive streetlights on Sector 4 have been non-functional for over 10 days, making the stretch unsafe at night.", photo: "/assets/issues/streetlight.jpeg" },
  { title: "Cracked Footpath", category: "roads", areaId: "civil-lines", location: "Mall Road", confirms: 19, priority: 68, oldStatus: "verified", resolved: false, severity: "Moderate", affected: "My Neighbourhood", description: "A large section of the footpath outside the row of shops has cracked and shifted, becoming a trip hazard for pedestrians.", photo: "/assets/issues/Footpath.jpg" },
  { title: "Overflowing Drain", category: "water", areaId: "swaroop-nagar", location: "Block C", confirms: 22, priority: 84, oldStatus: "assigned", resolved: false, severity: "High", affected: "Large Public Area", description: "A blocked storm drain has caused standing water and an unpleasant odour along Block C during the recent rains.", photo: "/assets/issues/drain.jpg" },
  { title: "Unsafe Pedestrian Crossing", category: "accessibility", areaId: "kakadeo", location: "Market Square", confirms: 16, priority: 70, oldStatus: "reported", resolved: false, severity: "High", affected: "Large Public Area", description: "There is no marked pedestrian crossing or signal near the market square despite heavy foot traffic and fast-moving vehicles.", photo: "/assets/issues/crossing.jpg" },
  { title: "Fallen Tree Branch", category: "greenery", areaId: "govind-nagar", location: "Block 4", confirms: 6, priority: 55, oldStatus: "reported", resolved: false, severity: "Low", affected: "My Street", description: "A large branch came down during recent winds and is partially blocking the side lane.", photo: "/assets/issues/tree.jpg" },
  { title: "Traffic Signal Malfunction", category: "traffic", areaId: "govind-nagar", location: "Main Crossing", confirms: 24, priority: 88, oldStatus: "assigned", resolved: false, severity: "Critical", affected: "Large Public Area", description: "The traffic signal at the main crossing has been stuck on red in all directions, causing congestion during peak hours.", photo: "/assets/issues/signal.jpg" },
  { title: "Broken Water Pipeline", category: "water", areaId: "shastri-nagar", location: "80 Feet Road", confirms: 31, priority: 79, oldStatus: "resolved", resolved: true, severity: "High", affected: "My Neighbourhood", description: "A ruptured pipeline was leaking freely onto the road, wasting water and softening the road surface.", resolutionNote: "Municipal team replaced the damaged section within 6 days of verification.", photo: "/assets/issues/pipeline.jpg" },
  { title: "Park Cleanliness", category: "cleanliness", areaId: "shastri-nagar", location: "Community Park", confirms: 18, priority: 58, oldStatus: "resolved", resolved: true, severity: "Moderate", affected: "My Neighbourhood", description: "The community park had accumulated litter around the benches and children's play area.", resolutionNote: "Local sanitation crew cleared the park and restored a weekly cleaning schedule.", photo: "/assets/issues/park.jpg" },
];

async function seed() {
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI — copy .env.example to .env.local and fill it in.");

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  await Area.deleteMany({});
  await Issue.deleteMany({});
  console.log("Cleared existing Area/Issue collections.");

  await Area.insertMany(AREAS);
  console.log(`Inserted ${AREAS.length} areas.`);

  const issueDocs = ISSUES.map((i) => ({
    title: i.title,
    category: i.category,
    areaId: i.areaId,
    location: i.location,
    description: i.description,
    confirms: i.confirms,
    priority: i.priority,
    status: mapStatus(i.oldStatus, i.resolved),
    severity: i.severity,
    affected: i.affected,
    // These point at the bundled /public/assets/issues/*.jpg files for demo purposes.
    // Real citizen-submitted reports get a Cloudinary secure_url instead — see /api/upload.
    photo: i.photo,
    resolutionNote: i.resolutionNote || "",
    resolvedAt: i.resolved ? new Date() : null,
    reportedBy: null, // seed data has no real Clerk user attached
  }));
  await Issue.insertMany(issueDocs);
  console.log(`Inserted ${issueDocs.length} issues.`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
