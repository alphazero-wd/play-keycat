import { getGameHistory } from "@/features/games/actions";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/users/actions";
import { Overview, PlayerStats } from "@/features/games/history";

interface GameHistoryPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Game History",
};

export default async function GameHistoryPage({
  params: { id },
}: GameHistoryPageProps) {
  const user = await getCurrentUser();
  const game = await getGameHistory(id);
  if (!game) redirect("/not-found");

  return (
    <div className="container max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        Game History
      </h1>
      <p className="font-normal md:text-lg text-muted-foreground">
        Here is the overview of the game
      </p>
      <Overview game={game} />

      <div>
        <h3 className="font-medium mb-1">Leaderboard</h3>
        <PlayerStats user={user} game={game} />
      </div>
    </div>
  );
}
