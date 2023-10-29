import { API_URL, PAGE_LIMIT } from "@/features/constants";
import { GameHistory } from "@/features/games/history";
import axios from "axios";

interface PlayerHistoriesReponse {
  playerHistories: GameHistory[];
  playerHistoriesCount: number;
}

export const getPlayerHistories = async (
  username: string,
  offset: number = 0,
) => {
  const { data } = await axios.get(
    `${API_URL}/player/${username}/histories?limit=${PAGE_LIMIT}&offset=${offset}`,
  );
  return data as PlayerHistoriesReponse;
};
