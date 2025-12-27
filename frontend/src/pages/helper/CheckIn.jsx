import Sidebar from "../../components/Sidebar";

export default function CheckIn() {
  return (
    <div className="flex">
      <Sidebar role="helper" />
      <div className="p-10 w-full">
        <h2 className="text-2xl font-bold mb-6">Face Check-In</h2>
        <div className="bg-white p-8 rounded-xl shadow w-96 text-center">
          <div className="w-40 h-40 mx-auto rounded-full bg-gray-200 mb-4"></div>
          <button className="bg-green-600 text-white px-6 py-2 rounded">
            Check-In Now
          </button>
        </div>
      </div>
    </div>
  );
}
