import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard } from "@/features/users/profile";
import { cn } from "@/lib/utils";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Position } from "../shared";
import {
  getPlayerPosition,
  getPlayerProgress,
  getPlayerWpm,
  useGameStore,
  usePlayersStore,
} from "./hooks";
import { GameMode } from "./types";

export const Players = ({
  userId,
  gameMode,
}: {
  userId: string;
  gameMode: GameMode;
}) => {
  const players = usePlayersStore.use.players();
  const hasFinished = useGameStore.use.hasFinished();
  const endedAt = useGameStore.use.endedAt();
  const leftPlayerIds = usePlayersStore.use.leftPlayerIds();

  return (
    <div className="mt-6 max-w-2xl space-y-4">
      {players.map((player) => (
        <div
          key={player.id}
          data-testid={"player-" + player.id}
          className={cn(
            "flex items-center justify-between",
            leftPlayerIds.has(player.id) && "opacity-50",
          )}
        >
          <div className="flex w-[200px] items-center justify-between">
            <ProfileCard
              gameMode={gameMode}
              username={player.username}
              userId={userId}
            />
            <Avatar
              className="transition-transform"
              style={{
                transform: `translateX(${getPlayerProgress(player.id) * 10}%)`,
              }}
            >
              <AvatarImage src="/icons/beginner.jpg" />
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
              {gameMode !== GameMode.PRACTICE ? (
                <div className="w-full flex-shrink-0 text-sm font-medium text-secondary-foreground">
                  {getPlayerPosition(player.id) > 0 && (
                    <Position position={getPlayerPosition(player.id)} />
                  )}
                </div>
              ) : (
                <div className="text-2xl">
                  {hasFinished ? (
                    <CheckIcon
                      title="finished"
                      className="h-5 w-5 text-green-500"
                    />
                  ) : (
                    endedAt && (
                      <XMarkIcon
                        title="failed"
                        className="h-5 w-5 text-red-500"
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
