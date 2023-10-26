import axios from "axios";
import { API_URL, HISTORIES_PAGE_LIMIT } from "@/features/shared/constants";
import { GameHistory } from "@/features/games/types";

interface PlayerHistoriesReponse {
  playerHistories: GameHistory[];
  playerHistoriesCount: number;
}

export const getPlayerHistories = async (
  username: string,
  offset: number = 0
) => {
  const { data } = await axios.get(
    `${API_URL}/player/${username}/histories?limit=${HISTORIES_PAGE_LIMIT}&offset=${offset}`
  );
  return data as PlayerHistoriesReponse;
};
