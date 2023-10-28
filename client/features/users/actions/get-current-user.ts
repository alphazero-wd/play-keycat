import axios from "axios";
import { cookies } from "next/headers";
import { API_URL } from "@/features/shared/constants";
import { User } from "../types";

export const getCurrentUser = async () => {
  try {
    const { data: user } = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Cookie: cookies().toString(),
      },
    });
    return user as User | undefined;
  } catch (error) {
    console.error(error);
  }
};
