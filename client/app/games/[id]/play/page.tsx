import { Gameplay, getGame } from "@/features/games/play";
import { getCurrentUser } from "@/features/users/me";
import { redirect } from "next/navigation";

interface GamePageProps {
  params: {
    id: string;
  };
}

export default async function GamePage({ params: { id } }: GamePageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const game = await getGame(id);
  if (!game) redirect("/not-found");
  console.log({ gameId: game.id });

  return <Gameplay user={user} game={game} />;
}
