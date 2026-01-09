import { useEffect, useState } from "react";
import API, { getFamilyAssignedHelpers } from "../../services/api";
import PostCard from '../../components/PostCard';
import postsService from '../../services/postsService';
import { Link } from 'react-router-dom';

export default function FamilyDashboard() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [assignedHelpers, setAssignedHelpers] = useState([]);

  useEffect(() => {
    API.get('/auth/profile').then((res) => setProfile(res.data)).catch(() => setProfile(null));
    import('../../services/api').then(({ getPosts }) => {
      getPosts().then((rows) => setPosts(rows)).catch(() => setPosts(postsService.getPosts()));
    }).catch(() => setPosts(postsService.getPosts()));
  }, []);

  const refresh = () => {
    import('../../services/api').then(({ getPosts }) => {
      getPosts().then((rows) => setPosts(rows)).catch(() => setPosts(postsService.getPosts()));
    }).catch(() => setPosts(postsService.getPosts()));
  };

  useEffect(() => {
    getFamilyAssignedHelpers().then((rows) => setAssignedHelpers(rows)).catch(() => setAssignedHelpers([]));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.name || 'there'} 👋</h1>
          <p className="text-gray-600">See what helpers are sharing — photos of their work and updates</p>

          <div className="flex gap-3 mt-4 flex-wrap">
            <Link to="/family/post-job" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all">
              Post Job
            </Link>
            <Link to="/family/payments" className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:shadow-lg transition-all">
              View Payments
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.length === 0 && (
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl text-center text-gray-600 md:col-span-2">
              <div className="text-lg font-semibold mb-2">No posts yet</div>
              <p className="text-sm">Helpers will share updates and photos of their work here</p>
            </div>
          )}

          {posts.map((p) => (
            <PostCard key={p.id} post={p} currentUser={profile} onFollowChange={() => refresh()} />
          ))}
        </div>
      </div>

      {/* Sidebar: Active Helpers */}
      <aside className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="font-semibold text-gray-800">Active Helpers</div>
            <div className="text-sm font-medium text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">{assignedHelpers.length}</div>
          </div>

          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {assignedHelpers.length === 0 && (
              <div className="text-sm text-center text-gray-500 py-6">
                <p className="font-medium">No active helpers</p>
                <p className="text-xs mt-1">Helpers assigned to jobs will appear here</p>
              </div>
            )}
            {assignedHelpers.map((h) => (
              <div key={h.jobId} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border border-transparent hover:border-blue-200">
                <img 
                  src={h.helperAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${h.helperName}`} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{h.helperName}</div>
                  <div className="text-xs text-gray-500 truncate">{h.helperEmail}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">{h.title}</div>
                </div>
                <div className="text-xs text-gray-500 text-right flex-shrink-0">
                  <div className="font-medium">{h.date}</div>
                  <div>{h.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
