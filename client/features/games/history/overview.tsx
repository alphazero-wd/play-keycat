"use client";
import { Label } from "@/features/ui/label";
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  HashtagIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { differenceInMilliseconds, format } from "date-fns";
import { useMemo } from "react";
import { Game } from "../play/types";
import { ModeBadge } from "./mode-badge";

export const Overview = ({ game }: { game: Game }) => {
  const attributes = useMemo(
    () => [
      { icon: HashtagIcon, text: game.id, label: "ID" },
      {
        icon: Squares2X2Icon,
        text: <ModeBadge mode={game.mode} />,
        label: "Mode",
      },
      {
        icon: CalendarDaysIcon,
        text: `${format(new Date(game.startedAt), "d MMM, Y h:mm a")}`,
        label: "Played at",
      },
      {
        icon: ClockIcon,
        text: `${format(
          differenceInMilliseconds(
            new Date(game.endedAt),
            new Date(game.startedAt),
          ),
          "m:ss",
        )}`,
        label: "Duration",
      },
      {
        icon: DocumentTextIcon,
        text: <p>{game.paragraph}</p>,
        label: "Text",
      },
    ],
    [game],
  );
  return (
    <div className="my-6">
      <ul className="space-y-4">
        {attributes.map((attr) => (
          <li
            key={attr.label}
            className="grid grid-cols-8 items-baseline gap-x-4 sm:grid-cols-6 lg:grid-cols-4"
          >
            <div className="relative top-1 flex items-center gap-x-4 text-muted-foreground">
              <attr.icon className="h-5 w-5 flex-shrink-0" />
              <Label className="hidden lg:block">{attr.label}</Label>
            </div>
            <div className="col-span-7 text-foreground sm:col-span-5 lg:col-span-3">
              {attr.text}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
