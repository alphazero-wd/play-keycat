"use client";
import { GameMode } from "@/features/games/play/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard } from "@/features/users/profile";

export const PlayerCell = ({
  username,
  userId,
  gameMode,
}: {
  username: string;
  userId?: string;
  gameMode: GameMode;
}) => {
  return (
    <div className="flex items-center gap-x-4">
      <Avatar>
        <AvatarImage src="/icons/beginner.jpg" alt={`@${username}`} />
        <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <ProfileCard gameMode={gameMode} username={username} userId={userId} />
    </div>
  );
};
