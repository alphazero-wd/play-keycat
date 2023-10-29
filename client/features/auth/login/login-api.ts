import { API_URL } from "@/features/constants";
import axios from "axios";
import { Login } from "./types";

export const login = async (body: Login) =>
  await axios.post(`${API_URL}/auth/login`, body, { withCredentials: true });
