"use client";
import React, { useMemo, useState } from "react";
import { Game } from "../types";
import {
  BoltIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { addSeconds, format } from "date-fns";
import { calculateTimeLimit } from "../utils";
import { Label } from "@/features/ui";
import { cn } from "@/lib/utils";

export const Overview = ({ game }: { game: Game }) => {
  const [truncated, setTruncated] = useState(false);

  const attributes = useMemo(
    () => [
      {
        icon: CalendarDaysIcon,
        text: format(
          addSeconds(new Date(game.startedAt), 10),
          "d MMM, Y h:mm a"
        ),
        label: "Started at",
      },
      {
        icon: ClockIcon,
        text: format(calculateTimeLimit(39, game.paragraph) * 1000, "mm:ss"),
        label: "Time limit",
      },
      {
        icon: DocumentTextIcon,
        text: (
          <>
            <p className={cn(truncated ? "line-clamp-3" : "line-clamp-none")}>
              {game.paragraph}{" "}
            </p>
            <span
              onClick={() => setTruncated(!truncated)}
              className="cursor-pointer text-sm font-medium text-primary hover:underline"
            >
              {truncated ? "More" : "Less"}
            </span>
          </>
        ),
        label: "Typing text",
      },
      { icon: BoltIcon, text: 39, label: "WPM required" },
      { icon: TrophyIcon, text: "95%", label: "Accuracy required" },
    ],
    [game, truncated]
  );
  return (
    <div className="my-6">
      <ul className="space-y-4">
        {attributes.map((attr) => (
          <li key={attr.label} className="grid grid-cols-4 gap-x-4">
            <div className="flex gap-x-4 items-center text-muted-foreground">
              <attr.icon className="w-5 h-5 flex-shrink-0" />
              <Label className="hidden lg:block">{attr.label}</Label>
            </div>
            <div className="text-foreground col-span-3">{attr.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
