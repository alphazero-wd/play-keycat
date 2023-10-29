import { API_URL } from "@/features/constants";
import { User } from "@/features/users/profile";
import axios from "axios";

export const getPlayerProfile = async (username: string) => {
  const { data: player } = await axios.get(
    `${API_URL}/users/${username}/profile`,
  );
  return player as User | undefined;
};
