"use client";
import { Label } from "@/features/ui/label";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";
import { addSeconds, format } from "date-fns";
import { useMemo, useState } from "react";
import { Game } from "../play";

export const Overview = ({ game }: { game: Game }) => {
  const [truncated, setTruncated] = useState(true);

  const attributes = useMemo(
    () => [
      { icon: HashtagIcon, text: game.id, label: "ID" },
      {
        icon: CalendarDaysIcon,
        text: format(
          addSeconds(new Date(game.startedAt), 10),
          "d MMM, Y h:mm a",
        ),
        label: "Started at",
      },
      {
        icon: DocumentTextIcon,
        text: (
          <>
            <p>
              {truncated ? game.paragraph.slice(0, 100) : game.paragraph}
              {truncated && game.paragraph.length >= 100 && "..."}{" "}
              {game.paragraph.length >= 100 && (
                <span
                  onClick={() => setTruncated(!truncated)}
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                >
                  {truncated ? "More" : "Less"}
                </span>
              )}
            </p>
          </>
        ),
        label: "Typing text",
      },
    ],
    [game, truncated],
  );
  return (
    <div className="my-6">
      <ul className="space-y-4">
        {attributes.map((attr) => (
          <li
            key={attr.label}
            className="grid grid-cols-8 gap-x-4 sm:grid-cols-6 lg:grid-cols-4"
          >
            <div className="flex items-center gap-x-4 text-muted-foreground">
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
