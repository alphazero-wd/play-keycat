import axios from "axios";
import { API_URL } from "@/features/shared/constants";
import { User } from "@/features/users/types";

interface TopPlayersResponse {
  topPlayers: User[];
  topPlayersCount: number;
}

export const getTopPlayers = async (offset: `${number}`) => {
  const { data } = await axios.get(
    `${API_URL}/leaderboards/players?offset=${offset}`
  );
  return data as TopPlayersResponse;
};
