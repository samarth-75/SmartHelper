import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

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

// Family: assigned helpers
export const getFamilyAssignedHelpers = () => API.get('/auth/family/assigned-helpers').then((res) => res.data);
// Family: recommended helpers
export const getHelpers = () => API.get('/auth/helpers').then((res) => res.data);

// Helper: assigned jobs
export const getHelperAssignedJobs = () => API.get('/auth/helper/assigned-jobs').then((res) => res.data);
// Helper: their applications (array of jobIds)
export const getHelperApplications = () => API.get('/applications/helper').then((res) => res.data);

export default API;
