import React from "react";

export default function ConfirmPaymentModal({ open, onClose, onConfirm, payment }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow">
        <h3 className="text-lg font-semibold mb-2">Confirm Payment</h3>
        <p className="mb-4">Are you sure you want to pay <strong>₹{payment.amount}</strong> to <strong>{payment.helperName}</strong>?</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-gradient-to-r from-green-400 to-green-500 text-white" onClick={onConfirm}>Confirm Payment</button>
        </div>
      </div>
    </div>
  );
}
