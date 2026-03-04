import axios from "axios";

const API_BASE = "http://localhost:4000"; // change to your backend URL

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterPayload) => {
  const res = await axios.post(`${API_BASE}/api/v1/auth/register`, data);
  return res.data;
};

export const loginUser = async (data: LoginPayload) => {
  const res = await axios.post(`${API_BASE}/api/v1/auth/login`, data);
  return res.data;
};
