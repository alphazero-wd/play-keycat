import { API_URL } from "@/features/constants";
import axios from "axios";

export const logout = async () =>
  await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
