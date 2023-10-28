"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/features/ui";
import Link from "next/link";
import { User } from "@/features/users/types";

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
