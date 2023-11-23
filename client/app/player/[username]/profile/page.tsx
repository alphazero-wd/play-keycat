import { Avatar, AvatarFallback, AvatarImage } from "@/features/ui/avatar";
import { PlayerGameHistories } from "@/features/users/histories";
import {
  About,
  ProfileShares,
  getPlayerProfile,
} from "@/features/users/profile";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface PlayerProfilePageProps {
  params: {
    username: string;
  };
  searchParams: {
    offset?: string;
  };
}

export const generateMetadata = async ({
  params: { username },
}: PlayerProfilePageProps): Promise<Metadata> => {
  const player = await getPlayerProfile(username);
  if (!player) return { title: "Player not found" };
  return {
    title: player.username,
    description: `Rank: ${player.rank} (${player.catPoints} CPs), Average WPM (last 10 games): ${player.lastTenAverageWpm}, Highest WPM: ${player.highestWpm}`,
  };
};

export default async function PlayerProfilePage({
  params: { username },
  searchParams: { offset },
}: PlayerProfilePageProps) {
  const player = await getPlayerProfile(username);
  if (!player) redirect("/not-found");

  return (
    <div className="container max-w-3xl space-y-6">
      <div className="flex items-center gap-x-8">
        <Avatar className="h-36 w-36">
          <AvatarImage className="object-cover" src="/icons/beginner.jpg" />
          <AvatarFallback>{player.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="w-full flex-1">
          <div className="flex items-center justify-between gap-x-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                {player.username}
              </h2>
              <p className="font-medium text-muted-foreground">
                @{player.username}
              </p>
            </div>
            <ProfileShares player={player} />
          </div>
          <div className="mt-4 space-y-1">
            <p className="flex items-center text-sm text-muted-foreground">
              <CalendarDaysIcon className="mr-2 h-5 w-5" />
              Joined {format(new Date(player.joinedAt), "MMMM Y")}
            </p>
            {/* <p className="flex items-center text-muted-foreground text-sm">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              <Link
                href={`/player/${player.id}/friends`}
                className="hover:underline"
              >
                <span className="font-medium">12</span> Friends
              </Link>
            </p> */}
          </div>
        </div>
      </div>

      <About player={player} />
      <div>
        <h3 className="font-medium text-foreground">Recent games</h3>
        <Suspense fallback={<div>Loading histories. Please wait...</div>}>
          <PlayerGameHistories username={username} offset={+(offset || 0)} />
        </Suspense>
      </div>
    </div>
  );
}
