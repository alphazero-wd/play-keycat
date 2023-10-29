import { API_URL } from "@/features/constants";
import axios from "axios";
import { Signup } from "./types";

export const signup = async (body: Signup) =>
  await axios.post(`${API_URL}/auth/signup`, body);
