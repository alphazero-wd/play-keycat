import { Overview, PlayerStats } from "@/features/games/history";
import { getGameHistory } from "@/features/games/history/get-game-history";
import { getCurrentUser } from "@/features/users/me";
import { redirect } from "next/navigation";

interface GameHistoryPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Game history",
};

export default async function GameHistoryPage({
  params: { id },
}: GameHistoryPageProps) {
  const user = await getCurrentUser();
  const game = await getGameHistory(id);
  if (!game) redirect("/not-found");
  if (game.histories.length === 0) redirect(`/games/${game.id}/play`);

  return (
    <div className="container max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        Game History
      </h1>
      <p className="font-normal text-muted-foreground md:text-lg">
        Here is the overview of the game
      </p>
      <Overview game={game} />

      <div>
        <h3 className="mb-1 font-medium">Leaderboard</h3>
        <PlayerStats user={user} game={game} />
      </div>
    </div>
  );
}
