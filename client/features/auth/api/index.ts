import axios from "axios";
import { Login, Signup } from "@/features/auth/types";
import { API_URL } from "@/features/shared/constants";

export const signup = async (body: Signup) =>
  await axios.post(`${API_URL}/auth/signup`, body);
export const login = async (body: Login) =>
  await axios.post(`${API_URL}/auth/login`, body, { withCredentials: true });
export const logout = async () =>
  await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
