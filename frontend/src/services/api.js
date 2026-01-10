import axios from "axios";

const API = axios.create({ baseURL: "https://smarthelper.onrender.com" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const fetchFamilyPayments = () => API.get("/payments/family").then((res) => res.data);
export const payPayment = (paymentId) => API.post("/payments", { paymentId }).then((res) => res.data);
export const createPayment = (payload) => API.post("/payments", payload).then((res) => res.data);
export const getHelperPayments = () => API.get("/payments/helper").then((res) => res.data);
export const markPaymentReceived = (paymentId) => API.post(`/payments/${paymentId}/receive`).then((res) => res.data);

// Reviews
export const submitReview = (payload) => API.post("/reviews", payload).then((res) => res.data);
export const getFamilyReviews = () => API.get("/reviews/family").then((res) => res.data);
export const getHelperReviews = () => API.get("/reviews/helper").then((res) => res.data);
export const getHelperRating = (helperId) => API.get(`/reviews/helper/${helperId}`).then((res) => res.data);

// Family: assigned helpers
const normalizeArray = (d) => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.rows)) return d.rows;
  if (Array.isArray(d.posts)) return d.posts;
  if (Array.isArray(d.helpers)) return d.helpers;
  return [];
};

export const getFamilyAssignedHelpers = () => API.get('/auth/family/assigned-helpers').then((res) => normalizeArray(res.data));
// Family: recommended helpers
export const getHelpers = () => API.get('/auth/helpers').then((res) => normalizeArray(res.data));

// Helper: assigned jobs
export const getHelperAssignedJobs = () => API.get('/auth/helper/assigned-jobs').then((res) => normalizeArray(res.data));
// Helper: their applications (array of jobIds)
export const getHelperApplications = () => API.get('/applications/helper').then((res) => normalizeArray(res.data));

// Chatbase: obtain a short-lived identity token for the currently authenticated user
export const getChatbaseToken = () => API.get('/auth/chatbase-token').then((res) => res.data);

// Posts
export const getPosts = () => API.get('/posts').then((res) => normalizeArray(res.data));
export const createPost = (payload) => API.post('/posts', payload).then((res) => res.data);
export const toggleFollow = (authorId) => API.post(`/posts/${authorId}/follow`).then((res) => res.data);
export const deletePost = (postId) => API.delete(`/posts/${postId}`).then((res) => res.data);
export const getFollowerCount = () => API.get('/posts/follower-count').then((res) => res.data);

export default API;
