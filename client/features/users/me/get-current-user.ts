import { API_URL } from "@/features/constants";
import axios from "axios";
import { cookies } from "next/headers";
import { User } from "../profile/types";

export const getCurrentUser = async () => {
  try {
    const { data: user } = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Cookie: cookies().toString(),
      },
      // @ts-ignore
      cache: "no-store",
    });
    return user as User | undefined;
  } catch (error) {
    console.error(error);
  }
};
