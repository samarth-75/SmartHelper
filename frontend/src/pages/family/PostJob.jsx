import Sidebar from "../../components/Sidebar";

export default function PostJob() {
  return (
    <div className="flex">
      <Sidebar role="family" />
      <div className="p-10 w-full">
        <h2 className="text-2xl font-bold mb-4">Post a Job</h2>
        <div className="bg-white p-6 rounded-xl shadow w-1/2">
          <input placeholder="Job Title" className="input" />
          <textarea placeholder="Description" className="input mt-3" />
          <input placeholder="Location" className="input mt-3" />
          <input placeholder="Pay per hour" className="input mt-3" />
          <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
            Post Job
          </button>
        </div>
      </div>
    </div>
  );
}
