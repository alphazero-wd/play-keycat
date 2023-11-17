"use client";
import { API_URL } from "@/features/constants";
import { useAlert } from "@/features/ui/alert";
import { timeout } from "@/features/utils";
import { socket } from "@/lib/socket";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCountdown, useGameStore, usePlayersStore } from "../play/hooks";

export const useJoinGame = () => {
  const [loading, setLoading] = useState(false);
  const setAlert = useAlert.use.setAlert();
  const router = useRouter();
  const resetPlayers = usePlayersStore.use.resetPlayers();
  const resetGame = useGameStore.use.resetGame();
  const resetCountdown = useCountdown.use.resetCountdown();
  const joinGame = async () => {
    socket.disconnect();

    setLoading(true);
    await timeout(1000);
    try {
      const { data: gameId } = await axios.post(
        `${API_URL}/games/join`,
        {},
        { withCredentials: true },
      );
      resetPlayers();
      resetGame();
      resetCountdown();
      router.replace(`/games/${gameId}/play`);
    } catch (error: any) {
      const message: string = error.response.data.message;
      setAlert("error", message);
    } finally {
      setLoading(false);
    }
  };
  return { joinGame, loading };
};
