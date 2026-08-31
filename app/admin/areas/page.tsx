import { connectDB } from "@/lib/mongodb";
import Area from "@/models/Area";
import AdminAreasEditor from "@/components/admin/AdminAreasEditor";

export default async function AdminAreasPage() {
  await connectDB();
  const areas = JSON.parse(JSON.stringify(await Area.find({}).sort({ name: 1 }).lean()));

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Areas</h1>
      <AdminAreasEditor initialAreas={areas} />
    </div>
  );
}
