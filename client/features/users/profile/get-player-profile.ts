import { API_URL } from "@/features/constants";
import axios from "axios";
import { Profile } from "./types";

export const getPlayerProfile = async (username: string) => {
  const { data: player } = await axios.get(
    `${API_URL}/users/${username}/profile`,
  );
  return player as Profile | undefined;
};
