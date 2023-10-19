import { getCurrentUser } from "@/features/users/actions";
import { redirect } from "next/navigation";
import { Button, Card, CardContent, CardHeader } from "../features/ui";
import Link from "next/link";

export const metadata = {
  title: "Keycat | Lobby",
};

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="container max-w-screen-xl">
      <h1 className="mb-1 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">
        Welcome back, {user.username}
      </h1>

      <p className="mb-5 text-secondary-foreground">
        Let&apos;s have some typing games
      </p>

      <Card className="max-w-3xl">
        <CardHeader>
          <h5 className="text-xl font-bold tracking-tight text-card-foreground">
            Ranked match
          </h5>
          <p className="font-normal text-muted-foreground">
            Compete with other players at your rank.
          </p>
        </CardHeader>

        <CardContent>
          <Button asChild>
            <Link href="/join-game">Join game</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
