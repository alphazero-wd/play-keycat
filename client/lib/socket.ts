import { io } from "socket.io-client";
import { API_URL } from "@/features/shared/constants";

export const socket = io(API_URL, {
  autoConnect: false,
  withCredentials: true,
});
