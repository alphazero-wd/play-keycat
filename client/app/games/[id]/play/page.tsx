import { Gameplay, getGame } from "@/features/games/play";
import { getCurrentUser } from "@/features/users/me";
import { redirect } from "next/navigation";

interface GamePageProps {
  params: {
    id: string;
  };
}

export const generateMetadata = async ({ params: { id } }: GamePageProps) => {
  const game = await getGame(id);
  if (!game) return { title: "Game not found" };
  return {
    title: "In-game " + game.mode[0] + game.mode.slice(1).toLowerCase(),
  };
};

export default async function GamePage({ params: { id } }: GamePageProps) {
  const game = await getGame(id);
  if (!game) redirect("/not-found");
  if (game.endedAt) redirect(`/games/${game.id}/history`);
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return <Gameplay user={user} game={game} />;
}
