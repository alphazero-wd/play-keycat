"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard, User } from "@/features/users/profile";

export const PlayerCell = ({ player, user }: { player: User; user?: User }) => {
  return (
    <div className="flex items-center gap-x-4">
      <Avatar>
        <AvatarImage src="/icons/sprout.jpg" alt={`@${player.username}`} />
        <AvatarFallback>{player.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <ProfileCard player={player} userId={user?.id} />
    </div>
  );
};
