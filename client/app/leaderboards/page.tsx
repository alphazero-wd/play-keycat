import { TopPlayersTable } from "@/features/leaderboards";
import { getCurrentUser } from "@/features/users/me";

export default async function LeaderboardsPage() {
  const user = await getCurrentUser();

  return (
    <div className="container max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        Leaderboards
      </h1>
      <p className="font-normal text-muted-foreground md:text-lg">
        Here are some of our all-time prestigious players.
      </p>

      <TopPlayersTable user={user} />
    </div>
  );
}
