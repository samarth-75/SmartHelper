import React from "react";

export default function PaymentSummary({ pending = [], paid = [] }) {
  const totalPaidThisMonth = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingCount = pending.length;
  const helpersPaid = new Set(paid.map((p) => p.helperId)).size;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg shadow transform hover:scale-105 transition">
        <div className="text-sm">Total Paid</div>
        <div className="text-2xl font-bold">₹{totalPaidThisMonth}</div>
      </div>

      <div className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg shadow transform hover:scale-105 transition">
        <div className="text-sm">Pending</div>
        <div className="text-2xl font-bold">{pendingCount}</div>
      </div>

      <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg shadow transform hover:scale-105 transition">
        <div className="text-sm">Helpers Paid</div>
        <div className="text-2xl font-bold">{helpersPaid}</div>
      </div>

      <div className="p-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg shadow transform hover:scale-105 transition">
        <div className="text-sm">Upcoming</div>
        <div className="text-2xl font-bold">{pendingCount}</div>
      </div>
    </div>
  );
}
