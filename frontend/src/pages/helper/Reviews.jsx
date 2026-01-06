import { useEffect, useState } from "react";
import { getHelperReviews } from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function Reviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, total: 0 });
  const [breakdown, setBreakdown] = useState([]);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getHelperReviews();
      setReviews(data.reviews || []);
      setSummary(data.summary || { avgRating: 0, total: 0 });
      setBreakdown(data.breakdown || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const findCount = (star) => {
    const row = breakdown.find((b) => b.rating === star);
    return row ? row.count : 0;
  };

  return (
    <div className="flex">
      <div className="p-8 w-full bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6">Reviews</h2>

        <section className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center gap-6">
            <div className="text-6xl font-bold text-yellow-400">{summary.avgRating ? Number(summary.avgRating).toFixed(1) : '—'}</div>
            <div>
              <div className="text-lg font-semibold">Average Rating</div>
              <div className="text-sm text-gray-500">{summary.total} review(s)</div>

              <div className="mt-4 space-y-2 w-64">
                {[5,4,3,2,1].map((s) => {
                  const count = findCount(s);
                  const percent = summary.total ? Math.round((count / summary.total) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-8 text-sm">{s}★</div>
                      <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
                        <div style={{ width: `${percent}%` }} className="h-3 bg-yellow-400"></div>
                      </div>
                      <div className="w-10 text-right text-sm text-gray-500">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Individual Reviews</h3>
          {loading ? (
            <div>Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="text-gray-500">No reviews yet — complete more jobs to earn reviews.</div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{r.familyName}</div>
                        <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {[1,2,3,4,5].map((i) => (
                          <svg key={i} className={`w-5 h-5 ${i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.851L19.335 24 12 20.201 4.665 24 6 15.599 0 9.748l8.332-1.73z"/></svg>
                        ))}
                      </div>
                      <div className="mt-3 text-gray-700">{r.comment}</div>
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