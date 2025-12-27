import Sidebar from "../../components/Sidebar";

export default function Attendance() {
  return (
    <div className="flex">
      <Sidebar role="family" />
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Attendance Records</h2>

        <div className="bg-white p-6 rounded-xl shadow">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th>Date</th>
                <th>Helper</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>27-12-2025</td>
                <td>Ramesh Patil</td>
                <td>9:05 AM</td>
                <td>5:10 PM</td>
                <td>8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
