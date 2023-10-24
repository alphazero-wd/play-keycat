import axios from "axios";
import { Game } from "../types";
import { API_URL } from "@/features/shared/constants";

export const getGameHistory = async (gameId: string) => {
  const { data } = await axios.get(`${API_URL}/games/${gameId}/history`);
  return data as Game | undefined;
};
