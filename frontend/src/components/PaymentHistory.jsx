import React from "react";

export default function PaymentHistory({ paid = [] }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <h3 className="text-lg font-semibold mb-3">Payment History</h3>
      <table className="w-full table-auto">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Helper</th>
            <th>Date Paid</th>
            <th>Job</th>
            <th>Amount</th>
            <th>Payment ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paid.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.helperName}</td>
              <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}</td>
              <td>{p.jobTitle}</td>
              <td>₹{p.amount}</td>
              <td className="font-mono text-sm">{p.id}</td>
              <td className="text-green-600 font-semibold">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 
