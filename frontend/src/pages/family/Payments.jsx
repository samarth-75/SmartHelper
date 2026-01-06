import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import PaymentSummary from "../../components/PaymentSummary";
import PaymentCard from "../../components/PaymentCard";
import PaymentHistory from "../../components/PaymentHistory";
import ConfirmPaymentModal from "../../components/ConfirmPaymentModal";
import { fetchFamilyPayments, payPayment, createPayment } from "../../services/api";
import toast from "react-hot-toast";

export default function Payments() {
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState({ pending: [], paid: [] });
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchFamilyPayments();

      // Support both the expected { pending, paid } shape and a fallback array of paid records
      if (Array.isArray(data)) {
        setPayments({ pending: [], paid: data });
      } else if (data && (Array.isArray(data.pending) || Array.isArray(data.paid))) {
        setPayments({ pending: data.pending || [], paid: data.paid || [] });
      } else {
        setPayments({ pending: [], paid: [] });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onPayClick = (p) => {
    setSelected(p);
    setConfirmOpen(true);
  };

  const confirmPay = async () => {
    try {
      // If a pre-existing payment id exists, use legacy pay endpoint
      if (selected?.id) {
        await payPayment(selected.id);
      } else {
        // Create payment by aggregating unpaid attendance rows for this helper/job
        await createPayment({ jobId: selected.jobId, helperId: selected.helperId });
      }
      toast.success("Payment successful");
      setConfirmOpen(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Payment failed");
    }
  };

  return (
    <div className="flex">
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Payments</h2>

        <PaymentSummary pending={payments.pending} paid={payments.paid} />

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Pending Payments</h3>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {payments.pending.length === 0 && <div className="text-gray-500">No pending payments</div>}
              {payments.pending.map((p) => (
                <PaymentCard key={p.id || `${p.helperId}-${p.jobId}` } payment={p} onPay={() => onPayClick(p)} />
              ))}
            </div>
          )}
        </div>

        <PaymentHistory paid={payments.paid} />

        <ConfirmPaymentModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmPay} payment={selected || {}} />
      </div>
    </div>
  );
}
