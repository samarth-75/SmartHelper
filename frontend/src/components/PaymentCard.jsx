import React from "react";

export default function PaymentCard({ payment, onPay }) {
  const { helperName, jobTitle, jobDate, hoursWorked, rate, amount, status } = payment;

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:scale-105 transition">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{helperName || "Unknown"}</div>
          <div className="text-sm text-gray-500">{jobTitle || ""} • {jobDate ? new Date(jobDate).toLocaleDateString() : ""}</div>
          <div className="text-sm mt-2">{hoursWorked} hrs × ₹{rate}/hr</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">₹{amount}</div>
          {status === "pending" ? (
            <button
              className="mt-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 rounded text-sm font-semibold"
              onClick={onPay}
            >
              Pay Now
            </button>
          ) : (
            <div className="text-green-600 font-semibold">Paid</div>
          )}
        </div>
      </div>
    </div>
  );
}
