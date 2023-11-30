"use client";
import { GameMode } from "@/features/games/play/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/features/ui/hover-card";
import { cn } from "@/lib/utils";
import {
  BoltIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/20/solid";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayerProfile } from "./get-player-profile";
import { ProfileLevel } from "./profile-level";
import { ProfileXPs } from "./profile-xps";
import { RankBadge } from "./rank-badge";
import { User } from "./types";

export const ProfileCard = ({
  player,
  userId,
  gameMode,
}: {
  player: User;
  userId?: number;
  gameMode: GameMode;
}) => {
  const [profile, setProfile] = useState<User | undefined>();

  useEffect(() => {
    getPlayerProfile(player.username).then((data) => setProfile(data));
  }, []);

  if (!profile) return;

  return (
    <HoverCard>
      <HoverCardTrigger asChild className="line-clamp-1">
        <div>
          <Link
            href={`/player/${player.username}/profile`}
            className={cn(
              gameMode === GameMode.RANKED && "text-primary",
              gameMode === GameMode.CASUAL &&
                "text-blue-600 dark:text-blue-300",
              gameMode === GameMode.PRACTICE &&
                "text-purple-600 dark:text-purple-300",
              "font-medium hover:underline",
            )}
          >
            @{player.username}
          </Link>{" "}
          <span>{player.id === userId && "(you)"}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 space-y-3">
        <div className="flex items-center gap-x-3">
          <Avatar>
            <AvatarImage src="/icons/beginner.jpg" />
            <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="w-full">
            <div className="flex items-baseline gap-x-2">
              <h4 className="text-lg font-semibold">{profile.username}</h4>
              <p className="font-medium text-muted-foreground">
                @{profile.username}
              </p>
            </div>
            <div className="flex w-full items-center gap-x-4">
              <ProfileLevel currentLevel={profile.currentLevel} />
              <ProfileXPs
                xpsGained={profile.xpsGained}
                xpsRequired={profile.xpsRequired}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex w-fit items-center gap-x-3">
            <RankBadge rank={profile.rank} size="sm" />
            <div
              className={cn(
                "text-foreground",
                profile.rank !== "Unranked" && "-ml-2",
              )}
            >
              <div className="text-base font-semibold">{profile.rank}</div>{" "}
              <div className="text-sm text-muted-foreground">
                {profile.catPoints} CPs
              </div>
            </div>
          </div>
          <div className="flex items-center pt-2 text-secondary-foreground">
            <BookOpenIcon className="mr-2 h-5 w-5 text-muted-foreground" />{" "}
            <span className="text-sm">
              <span className="text-base font-semibold">
                {profile.gamesPlayed}
              </span>{" "}
              games played
            </span>
          </div>
          <div className="flex items-center text-secondary-foreground">
            <BoltIcon className="mr-2 h-5 w-5 text-muted-foreground" />{" "}
            <span className="text-sm">
              Highest:{" "}
              <span className="text-base font-semibold">
                {profile.highestWpm}
              </span>{" "}
              WPM
            </span>
          </div>
          <div className="flex items-center text-secondary-foreground">
            <PresentationChartLineIcon className="mr-2 h-5 w-5 text-muted-foreground" />{" "}
            <span className="text-sm">
              Average (last 10):{" "}
              <span className="text-base font-semibold">
                {profile.lastTenAverageWpm.toFixed(0)}
              </span>{" "}
              WPM
            </span>
          </div>
          <div className="flex items-center pt-2 text-xs text-muted-foreground">
            <CalendarDaysIcon className="mr-2 h-5 w-5 opacity-70" />{" "}
            <span className="text-sm">
              Joined {format(new Date(profile.joinedAt), "MMMM Y")}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
