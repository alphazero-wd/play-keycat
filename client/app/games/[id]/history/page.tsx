import { Overview, PlayerStats } from "@/features/games/history";
import { getGameHistory } from "@/features/games/history/get-game-history";
import { Button } from "@/features/ui/button";
import { getCurrentUser } from "@/features/users/me";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { redirect } from "next/navigation";

interface GameHistoryPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Game - History",
};

export default async function GameHistoryPage({
  params: { id },
}: GameHistoryPageProps) {
  const user = await getCurrentUser();
  const game = await getGameHistory(id);
  if (!game || game.histories.length === 0) redirect("/not-found");

  return (
    <div className="container max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        Game History
      </h1>
      <p className="font-normal text-muted-foreground md:text-lg">
        Here is the overview of the game
      </p>
      <Overview game={game} />

      <div className="mb-5">
        <h3 className="mb-1 font-medium">Leaderboard</h3>
        <PlayerStats
          userId={user?.id}
          histories={game.histories}
          gameMode={game.mode}
        />
      </div>

      <Button variant="outline" asChild>
        <Link href="/">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to lobby
        </Link>
      </Button>
    </div>
  );
}
