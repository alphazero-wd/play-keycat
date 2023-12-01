import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { ProfileCard, User } from "@/features/users/profile";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { Position } from "../history";
import {
  getPlayerPosition,
  getPlayerProgress,
  getPlayerWpm,
  useGameStore,
  usePlayersStore,
} from "./hooks";
import { GameMode } from "./types";

export const Players = ({
  user,
  gameMode,
}: {
  user: User;
  gameMode: GameMode;
}) => {
  const players = usePlayersStore.use.players();
  const hasFinished = useGameStore.use.hasFinished();
  const endedAt = useGameStore.use.endedAt();
  const leftPlayerIds = usePlayersStore.use.leftPlayerIds();

  return (
    <div className="mt-6 max-w-2xl space-y-4">
      {players.map((player) => (
        <div key={player.id} className="flex items-center justify-between">
          <div className="flex w-[200px] items-center justify-between">
            <ProfileCard gameMode={gameMode} player={player} userId={user.id} />
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
              <XMarkIcon className="h-5 w-5 text-red-500" />
              {gameMode !== GameMode.PRACTICE ? (
                endedAt && leftPlayerIds.has(player.id) ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <XMarkIcon className="h-5 w-5 text-red-500" />
                      </TooltipTrigger>
                      <TooltipContent>AFK Player</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <div className="w-full flex-shrink-0 text-sm font-medium text-secondary-foreground">
                    {getPlayerPosition(player.id) > 0 && (
                      <Position position={getPlayerPosition(player.id)} />
                    )}
                  </div>
                )
              ) : (
                <div className="text-2xl">
                  {hasFinished ? (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    endedAt && <XMarkIcon className="h-5 w-5 text-red-500" />
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
