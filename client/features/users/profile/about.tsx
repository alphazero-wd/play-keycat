import Image from "next/image";
import { Player } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/ui";
import { getCurrentRank } from "../utils";

export const About = ({ player }: { player: Player }) => {
  return (
    <div>
      <h3 className="font-medium text-foreground">About the player</h3>
      <div className="mt-1 mb-2" />
      <div className="grid md:grid-cols-2 gap-x-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-card-foreground">
              {getCurrentRank(player.catPoints)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {player.catPoints < 500 ? (
              <div className="w-[200px] h-[200px] mx-auto border-2 border-dashed rounded-full border-muted-foreground" />
            ) : (
              <Image
                src={`/images/${getCurrentRank(player.catPoints)
                  .split(" ")[0]
                  .toLowerCase()}.png`}
                width={200}
                className="mx-auto"
                height={200}
                alt={getCurrentRank(player.catPoints) + " Badge"}
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
          <CardContent className="flex gap-y-3 flex-col items-center">
            <div className="text-center mt-3">
              <h3 className="font-medium block text-card-foreground text-lg">
                Games Played
              </h3>
              <p className="text-2xl text-muted-foreground">
                {player.gamesPlayed}
              </p>
            </div>

            <div className="text-center mt-3">
              <h3 className="font-medium block text-card-foreground text-lg">
                WPM (last 10 games)
              </h3>
              <p className="text-2xl text-muted-foreground">
                {Math.round(player.lastTenAverageWpm)}
              </p>
            </div>
            <div className="text-center mt-3">
              <h3 className="font-medium block text-card-foreground text-lg">
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
