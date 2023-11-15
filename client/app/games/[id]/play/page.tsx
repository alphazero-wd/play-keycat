import { Gameplay, getGame } from "@/features/games/play";
import { getCurrentUser } from "@/features/users/me";
import { redirect } from "next/navigation";

interface GamePageProps {
  params: {
    id: string;
  };
}

export default async function GamePage({ params: { id } }: GamePageProps) {
  const game = await getGame(id);
  if (!game) redirect("/not-found");
  if (game.endedAt) redirect(`/games/${game.id}/history`);
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return <Gameplay user={user} game={game} />;
}
