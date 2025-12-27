import Sidebar from "../../components/Sidebar";

export default function Earnings() {
  return (
    <div className="flex">
      <Sidebar role="helper" />
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">My Earnings</h2>

        <div className="bg-white p-6 rounded-xl shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th>Date</th>
                <th>Hours</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>27-12-2025</td>
                <td>8</td>
                <td>₹1200</td>
                <td className="text-green-600">Received</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
