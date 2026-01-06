import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { getHelperPayments, markPaymentReceived } from "../../services/api";

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState([]);
  const [pending, setPending] = useState([]);
  const [receiving, setReceiving] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getHelperPayments();
      setPaid(data.paid || []);
      setPending(data.pending || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const totalEarned = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = pending.reduce((s, p) => s + (p.amount || 0), 0);

  const handleMarkReceived = async (paymentId) => {
    setReceiving(paymentId);
    try {
      await markPaymentReceived(paymentId);
      await fetch();
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to mark payment as received');
    } finally {
      setReceiving(null);
    }
  };

  return (
    <div className="flex">
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">My Earnings</h2>

        <div className="grid gap-6 mb-6 grid-cols-1 md:grid-cols-3">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-sm text-gray-500">Total Earned</div>
            <div className="text-2xl font-bold mt-2">₹{totalEarned}</div>
            <div className="text-sm text-gray-500 mt-1">{paid.length} payment(s)</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-bold mt-2">₹{totalPending}</div>
            <div className="text-sm text-gray-500 mt-1">{pending.length} pending job(s)</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-sm text-gray-500">Recent Payment</div>
            <div className="text-lg font-semibold mt-2">{paid[0] ? `₹${paid[0].amount}` : '—'}</div>
            <div className="text-sm text-gray-500 mt-1">{paid[0] ? new Date(paid[0].createdAt).toLocaleDateString() : ''}</div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold mb-4">Paid Payments</h3>
            {loading ? <div>Loading…</div> : paid.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow">No payments received yet.</div>
            ) : (
              <div className="space-y-3">
                {paid.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p.jobTitle || 'Job'}</div>
                      <div className="text-sm text-gray-500">{p.hoursWorked} hrs · ₹{p.rate}/hr</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{p.amount}</div>
                      <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</div>
                      {p.status === 'paid' ? (
                        <button disabled={receiving === p.id} onClick={() => handleMarkReceived(p.id)} className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm">
                          {receiving === p.id ? 'Confirming…' : 'Mark as received'}
                        </button>
                      ) : p.status === 'received' ? (
                        <div className="mt-2 text-sm text-green-600">Received</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Pending Payments</h3>
            {loading ? <div>Loading…</div> : pending.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow">No pending payments.</div>
            ) : (
              <div className="space-y-3">
                {pending.map((p, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{p.jobTitle || 'Job'}</div>
                      <div className="text-sm text-gray-500">{p.hoursWorked} hrs · ₹{p.rate}/hr</div>
                      <div className="text-sm text-gray-500">Family: {p.familyName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{p.amount}</div>
                      <div className="text-sm text-gray-500">{p.jobDate ? new Date(p.jobDate).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
