import { API_URL } from "@/features/constants";
import axios from "axios";
import { Game } from "../play/types";

export const getGameHistory = async (gameId: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/games/${gameId}/history`, {
      withCredentials: true,
    });
    return data as Game | undefined;
  } catch (error) {
    console.error(error);
  }
};
