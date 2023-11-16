import { API_URL } from "@/features/constants";
import axios from "axios";
import { cookies } from "next/headers";
import { Game } from "./types";

export const getGame = async (id: string) => {
  try {
    const { data: game } = await axios.get(`${API_URL}/games/${id}`, {
      headers: {
        Cookie: cookies().toString(),
      },
    });
    return game as Game | undefined;
  } catch (error) {
    console.error(error);
  }
};
