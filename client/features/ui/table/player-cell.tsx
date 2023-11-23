"use client";
import { GameMode } from "@/features/games/play/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard, User } from "@/features/users/profile";

export const PlayerCell = ({
  player,
  user,
  gameMode,
}: {
  player: User;
  user?: User;
  gameMode: GameMode;
}) => {
  return (
    <div className="flex items-center gap-x-4">
      <Avatar>
        <AvatarImage src="/icons/beginner.jpg" alt={`@${player.username}`} />
        <AvatarFallback>{player.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <ProfileCard gameMode={gameMode} player={player} userId={user?.id} />
    </div>
  );
};
