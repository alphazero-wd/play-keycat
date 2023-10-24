import { Gameplay } from "@/features/games/play";
import { getCurrentUser } from "@/features/users/actions";
import { redirect } from "next/navigation";

export default async function JoinGamePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return <Gameplay user={user} />;
}