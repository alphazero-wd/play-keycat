"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { User } from "@/features/users/profile";
import Link from "next/link";

export const PlayerCell = ({ player, user }: { player: User; user?: User }) => {
  return (
    <div className="flex items-center gap-x-4">
      <Avatar>
        <AvatarImage src="/icons/sprout.jpg" alt={`@${player.username}`} />
        <AvatarFallback>{player.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <Link
          href={`/player/${player.username}/profile`}
          className="font-medium text-primary hover:underline"
        >
          @{player.username}
        </Link>{" "}
        <span>{player.id === user?.id && "(you)"}</span>
      </div>
    </div>
  );
};
