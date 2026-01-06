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

export default API;
