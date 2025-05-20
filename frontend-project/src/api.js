// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3012", // adjust if different
});

export default api;
