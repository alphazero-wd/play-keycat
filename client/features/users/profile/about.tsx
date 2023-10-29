import { Card, CardContent, CardHeader, CardTitle } from "@/features/ui/card";
import Image from "next/image";
import { User } from "../profile";
import { getCurrentRank } from "./get-current-rank";

export const About = ({ player }: { player: User }) => {
  return (
    <div>
      <h3 className="font-medium text-foreground">About the player</h3>
      <div className="mb-2 mt-1" />
      <div className="grid gap-x-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-card-foreground">
              {getCurrentRank(player.catPoints)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {player.catPoints < 500 ? (
              <div className="mx-auto h-[200px] w-[200px] rounded-full border-2 border-dashed border-muted-foreground" />
            ) : (
              <Image
                src={`/images/${getCurrentRank(player.catPoints)
                  .split(" ")[0]
                  .toLowerCase()}.png`}
                width={200}
                className="mx-auto"
                height={200}
                alt={getCurrentRank(player.catPoints)}
              />
            )}

            <p className="mt-3 text-foreground">
              <span className="text-2xl font-medium text-muted-foreground">
                {player.catPoints}
              </span>{" "}
              CPs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-card-foreground">
              Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-y-3">
            <div className="mt-3 text-center">
              <h3 className="block text-lg font-medium text-card-foreground">
                Games Played
              </h3>
              <p className="text-2xl text-muted-foreground">
                {player.gamesPlayed}
              </p>
            </div>

            <div className="mt-3 text-center">
              <h3 className="block text-lg font-medium text-card-foreground">
                WPM (last 10 games)
              </h3>
              <p className="text-2xl text-muted-foreground">
                {Math.round(player.lastTenAverageWpm)}
              </p>
            </div>
            <div className="mt-3 text-center">
              <h3 className="block text-lg font-medium text-card-foreground">
                Highest WPM
              </h3>
              <p className="text-2xl text-muted-foreground">
                {player.highestWpm}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
