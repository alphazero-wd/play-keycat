import axios from "axios";
import { API_URL } from "@/features/shared/constants";
import { Player } from "../types";

export const getPlayerProfile = async (username: string) => {
  const { data: player } = await axios.get(
    `${API_URL}/users/${username}/profile`
  );
  return player as Player | undefined;
};
