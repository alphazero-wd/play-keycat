import { API_URL } from "@/features/constants";
import { User } from "@/features/users/profile";
import axios from "axios";

interface TopPlayersResponse {
  topPlayers: User[];
  topPlayersCount: number;
}

export const getTopPlayers = async (offset: `${number}`) => {
  const { data } = await axios.get(
    `${API_URL}/leaderboards/players?offset=${offset}`,
  );
  return data as TopPlayersResponse;
};
