import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard, User } from "@/features/users/profile";
import { Position } from "../history";
import {
  getPlayerPosition,
  getPlayerProgress,
  getPlayerWpm,
  usePlayersStore,
} from "./hooks";

export const Players = ({ user }: { user: User }) => {
  const players = usePlayersStore.use.players();

  return (
    <div className="mt-6 max-w-2xl space-y-4">
      {players.map((player) => (
        <div key={player.id} className="flex items-center justify-between">
          <div className="flex w-[200px] items-center justify-between">
            <ProfileCard player={player} userId={user.id} />
            <Avatar
              className="transition-transform"
              style={{
                transform: `translateX(${getPlayerProgress(player.id) * 10}%)`,
              }}
            >
              <AvatarImage src="/icons/sprout.jpg" />
              <AvatarFallback>
                {player.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="relative left-16 flex-shrink-0 text-muted-foreground">
            <div className="mt-3 flex items-center gap-x-3">
              <div className="whitespace-nowrap text-muted-foreground">
                <span className="text-lg font-semibold">
                  {getPlayerWpm(player.id)}
                </span>{" "}
                WPM
              </div>
              <div className="w-full flex-shrink-0 text-sm font-medium text-secondary-foreground">
                {getPlayerPosition(player.id) > 0 && (
                  <Position position={getPlayerPosition(player.id)} />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
