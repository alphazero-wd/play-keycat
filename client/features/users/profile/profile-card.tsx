"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/features/ui/hover-card";
import {
  BoltIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  PresentationChartBarIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/20/solid";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentRank } from "./get-current-rank";
import { getPlayerProfile } from "./get-player-profile";
import { RankBadge } from "./rank-badge";
import { User } from "./types";

export const ProfileCard = ({
  player,
  userId,
}: {
  player: User;
  userId?: number;
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
            className="font-medium text-primary hover:underline"
          >
            @{player.username}
          </Link>{" "}
          <span>{player.id === userId && "(you)"}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 space-y-3">
        <div className="flex w-fit items-center gap-x-3">
          <Avatar>
            <AvatarImage src="/icons/sprout.jpg" />
            <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <RankBadge catPoints={profile.catPoints} size="sm" />
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-x-2">
            <h4 className="text-lg font-semibold">{profile.username}</h4>
            <p className="text-primary">@{profile.username}</p>
          </div>
          <div className="flex items-center text-foreground">
            <PresentationChartBarIcon className="mr-2 h-5 w-5 text-muted-foreground" />{" "}
            <span>
              <span className="text-base font-semibold">
                {getCurrentRank(profile.catPoints)}
              </span>{" "}
              <span className="text-sm text-muted-foreground">
                {profile.catPoints} CPs
              </span>
            </span>
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
