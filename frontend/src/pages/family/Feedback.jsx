import Sidebar from "../../components/Sidebar";

export default function Feedback() {
  return (
    <div className="flex">
      <Sidebar role="helper" />
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Feedback</h2>

        <div className="bg-white p-6 rounded-xl shadow w-1/2">
          <textarea className="border p-2 w-full rounded" placeholder="Write feedback..."></textarea>
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-3">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
