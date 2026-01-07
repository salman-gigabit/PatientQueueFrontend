import axios from "axios";
import api from "./axiosConfig";

const API = import.meta.env.VITE_API || "http://localhost:8000";

// Centralized function to set token globally for both the shared api instance and axios defaults
export const setAuthToken = (token) => {
  const clean = token?.trim();
  if (clean) {
    api.defaults.headers.common["Authorization"] = `Bearer ${clean}`;
    axios.defaults.headers.common["Authorization"] = `Bearer ${clean}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Login API
export const login = (email, password) =>
  api.post(`/auth/login`, { email, password });

// Signup API
export const signup = (name, email, password) =>
  api.post(`/auth/signup`, { name, email, password });

// Get current user from backend using token
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return Promise.reject(new Error("No token in localStorage"));
  }
  setAuthToken(token);
  return api.get(`/auth/me`);
};
