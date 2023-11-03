import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard, User } from "@/features/users/profile";
import { getProgress, usePlayersStore } from "./hooks";

export const Players = ({ user }: { user: User }) => {
  const { players } = usePlayersStore();
  return (
    <div className="mt-6 max-w-2xl space-y-4">
      {players.map((player) => (
        <div key={player.id} className="flex items-center justify-between">
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

          <span className="flex-shrink-0 text-muted-foreground">
            {getProgress(player.id)}%
          </span>
        </div>
      ))}
    </div>
  );
};
