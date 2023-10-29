import { API_URL } from "@/features/constants";
import { useAlert } from "@/features/ui/alert";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useJoinGame = () => {
  const [loading, setLoading] = useState(false);
  const { setAlert } = useAlert();
  const router = useRouter();
  const joinGame = async () => {
    try {
      setLoading(true);
      const { data: gameId } = await axios.post(
        `${API_URL}/games/join`,
        {},
        { withCredentials: true },
      );
      router.push(`/games/${gameId}/play`);
    } catch (error: any) {
      const message: string = error.response.data.message;
      setAlert("error", message);
    } finally {
      setLoading(false);
    }
  };
  return { joinGame, loading };
};
