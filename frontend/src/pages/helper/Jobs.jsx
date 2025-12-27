import Sidebar from "../../components/Sidebar";

export default function Jobs() {
  return (
    <div className="flex">
      <Sidebar role="helper" />
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Available Jobs</h2>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-bold">House Cleaning</h3>
            <p>Pune – ₹150/hr</p>
            <button className="bg-blue-600 text-white px-4 py-1 rounded mt-3">Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
}
