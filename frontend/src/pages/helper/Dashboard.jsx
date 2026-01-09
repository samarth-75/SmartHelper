import { useEffect, useState } from 'react';
import API from '../../services/api';
import postsService from '../../services/postsService';
import PostCard from '../../components/PostCard';
import CreatePostModal from '../../components/CreatePostModal';
import AttendanceCalendar from '../../components/AttendanceCalendar';
import { Link } from 'react-router-dom';
import { getHelperAssignedJobs } from '../../services/api';
import { Plus } from 'lucide-react';

export default function HelperDashboard() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    API.get('/auth/profile').then((res) => setProfile(res.data)).catch(() => setProfile(null));
    import('../../services/api').then(({ getPosts }) => {
      getPosts().then((rows) => setPosts(rows)).catch(() => setPosts(postsService.getPosts()));
    }).catch(() => setPosts(postsService.getPosts()));
    API.get('/attendance/helper').then((res) => setAttendance(res.data)).catch(() => setAttendance([]));
  }, []);

  useEffect(() => {
    getHelperAssignedJobs().catch(() => []);
  }, []);

  const onCreated = (post) => {
    import('../../services/api').then(({ getPosts }) => {
      getPosts().then((rows) => setPosts(rows)).catch(() => setPosts(postsService.getPosts()));
    }).catch(() => setPosts(postsService.getPosts()));
  };

  const refresh = () => {
    import('../../services/api').then(({ getPosts }) => {
      getPosts().then((rows) => setPosts(rows)).catch(() => setPosts(postsService.getPosts()));
    }).catch(() => setPosts(postsService.getPosts()));
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const filteredPosts = filter === 'mine' ? posts.filter(p => p.author.id === profile?.id) : posts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.name || 'there'} 🎉</h1>
          <p className="text-gray-600">Share photos of your work — families and helpers can see and follow you</p>

          <div className="flex gap-3 mt-4 flex-wrap">
            <Link to="/helper/jobs" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all">Browse Jobs</Link>
            <Link to="/helper/attendance" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all">Mark Attendance</Link>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>

        {showCreateModal && (
          <CreatePostModal
            profile={profile}
            onCreated={onCreated}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            View All Posts
          </button>
          <button onClick={() => setFilter('mine')} className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'mine' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            View My Posts
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.length === 0 && (
            <div className="p-6 bg-white border rounded-2xl text-center text-gray-600 md:col-span-2">{filter === 'mine' ? 'No posts yet — create one to showcase your work.' : 'No posts available.'}</div>
          )}

          {filteredPosts.map((p) => (
            <PostCard 
              key={p.id} 
              post={p} 
              currentUser={profile} 
              onFollowChange={() => refresh()}
              onDelete={handleDeletePost}
              showDelete={filter === 'mine'}
            />
          ))}
        </div>
      </div>

      {/* Sidebar: Attendance Calendar */}
      <aside>
        <AttendanceCalendar attendance={attendance} />
      </aside>
    </div>
  );
}
