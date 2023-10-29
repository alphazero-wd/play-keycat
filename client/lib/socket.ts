import { API_URL } from "@/features/constants";
import { io } from "socket.io-client";

export const socket = io(API_URL, {
  autoConnect: false,
  withCredentials: true,
});
