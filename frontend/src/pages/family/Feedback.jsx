import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import Sidebar from "../../components/Sidebar";
import { getFamilyReviews, submitReview } from "../../services/api";

function StarPicker({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center">
      {[1,2,3,4,5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="p-1"
          aria-label={`Rate ${s}`}
        >
          <svg className={`w-6 h-6 ${ (hover || value) >= s ? 'text-yellow-400' : 'text-gray-300' }`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .587l3.668 7.431L24 9.748l-6 5.851L19.335 24 12 20.201 4.665 24 6 15.599 0 9.748l8.332-1.73z"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const [pending, setPending] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({}); // jobId -> bool

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getFamilyReviews();
      setPending(data.pending || []);
      setSubmitted(data.submitted || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (jobId, helperId, rating, comment) => {
    setSubmitting((s) => ({ ...s, [jobId]: true }));
    try {
      await submitReview({ jobId, helperId, rating, comment });
      await fetch();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting((s) => ({ ...s, [jobId]: false }));
    }
  };

  return (
    <div className="flex">
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Feedback</h2>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Pending Reviews</h3>
          {loading ? (
            <div>Loading…</div>
          ) : pending.length === 0 ? (
            <div className="text-gray-500">No pending reviews — great job staying up to date!</div>
          ) : (
            <div className="grid gap-4">
              {pending.map((p) => (
                <PendingReviewCard key={p.paymentId} p={p} onSubmit={handleSubmit} submitting={!!submitting[p.jobId]} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Submitted Reviews</h3>
          {loading ? (
            <div>Loading…</div>
          ) : submitted.length === 0 ? (
            <div className="text-gray-500">No reviews submitted yet.</div>
          ) : (
            <div className="grid gap-4">
              {submitted.map((s) => (
                <div key={s.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{s.helperName}</div>
                        <div className="text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center">
                          {[1,2,3,4,5].map((i) => (
                            <svg key={i} className={`w-5 h-5 ${i <= s.rating ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.851L19.335 24 12 20.201 4.665 24 6 15.599 0 9.748l8.332-1.73z"/></svg>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 text-gray-700">{s.comment}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PendingReviewCard({ p, onSubmit, submitting }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{p.helperName || 'Assigned helper'}</div>
          <div className="text-sm text-gray-500">Job: {p.jobTitle}</div>
          <div className="text-sm text-gray-500">Paid on: {new Date(p.createdAt).toLocaleDateString()}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Rating</div>
          <StarPicker value={rating} onChange={setRating} />
        </div>
      </div>

      <div className="mt-3">
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a short note (optional)" className="w-full border p-2 rounded" />
      </div>

      <div className="mt-3 text-right">
        <button disabled={submitting} onClick={() => onSubmit(p.jobId, p.helperId || p.helperId, rating, comment)} className="bg-blue-600 text-white px-4 py-2 rounded">
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
