import Sidebar from "../../components/Sidebar";
import SmartMatchCard from "../../components/SmartMatchCard";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar role="family" />
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Family Dashboard</h2>

        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-xl shadow">Active Jobs: 2</div>
          <div className="bg-white p-5 rounded-xl shadow">Helpers Assigned: 1</div>
          <div className="bg-white p-5 rounded-xl shadow">Hours Worked: 12</div>
          <div className="bg-white p-5 rounded-xl shadow">Pending Payments: ₹1200</div>
        </div>

        <h3 className="text-xl font-bold mb-4">SmartMatch – Recommended Helpers</h3>

        <div className="grid grid-cols-3 gap-6">
          <SmartMatchCard name="Ramesh Patil" skill="House Cleaning" score={90} distance={1.2} />
          <SmartMatchCard name="Asha More" skill="Cooking" score={86} distance={0.8} />
          <SmartMatchCard name="Sunil Desai" skill="Elder Care" score={82} distance={1.5} />
        </div>
      </div>
    </div>
  );
}
