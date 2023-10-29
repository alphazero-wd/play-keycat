import { GameModes } from "@/features/games/lobby";
import { getCurrentUser } from "@/features/users/me";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Keycat | Lobby",
};

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="container max-w-screen-xl">
      <h1 className="mb-1 text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
        Welcome back, {user.username}
      </h1>

      <p className="mb-5 text-secondary-foreground">
        Let&apos;s have some typing games
      </p>

      <GameModes />
    </div>
  );
}
