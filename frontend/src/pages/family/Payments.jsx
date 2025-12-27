import Sidebar from "../../components/Sidebar";

export default function Payments() {
  return (
    <div className="flex">
      <Sidebar role="family" />
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Payments</h2>

        <div className="bg-white p-6 rounded-xl shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th>Helper</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Asha More</td>
                <td>27-12-2025</td>
                <td>6</td>
                <td>₹900</td>
                <td className="text-green-600 font-semibold">Paid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
