import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard, User } from "@/features/users/profile";
import { cn } from "@/lib/utils";
import { displayPosition } from "../history";
import { getPosition, getProgress, usePlayersStore } from "./hooks";

export const Players = ({ user }: { user: User }) => {
  const { players, leftPlayerIds, playersPosition } = usePlayersStore();

  return (
    <div className="mt-6 max-w-2xl space-y-4">
      {players.map((player) => (
        <div
          key={player.id}
          className={cn(
            "flex items-center justify-between",
            leftPlayerIds.has(player.id) && "opacity-50",
          )}
        >
          <div className="flex w-[200px] items-center justify-between">
            <ProfileCard player={player} userId={user.id} />
            <Avatar
              className="transition-transform"
              style={{
                transform: `translateX(${getProgress(player.id) * 10}%)`,
              }}
            >
              <AvatarImage src="/icons/sprout.jpg" />
              <AvatarFallback>
                {player.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="relative left-8 flex-shrink-0 text-muted-foreground">
            <div className="mt-3 flex items-center gap-x-4">
              {getProgress(player.id)}%
              <div className="w-full flex-shrink-0">
                {getPosition(player.id) > 0 &&
                  displayPosition(getPosition(player.id)!)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
