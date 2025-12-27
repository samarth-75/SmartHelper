import Sidebar from "../../components/Sidebar";
import ReliabilityCard from "../../components/ReliabilityCard";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar role="helper" />
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Helper Dashboard</h2>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl shadow">Jobs Applied: 4</div>
          <div className="bg-white p-5 rounded-xl shadow">Jobs Assigned: 2</div>
          <div className="bg-white p-5 rounded-xl shadow">Hours Worked: 18</div>
          <div className="bg-white p-5 rounded-xl shadow">Earnings: ₹3200</div>
        </div>

        <ReliabilityCard score={82} />
      </div>
    </div>
  );
}
