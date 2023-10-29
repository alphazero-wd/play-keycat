import { getPlayerHistories } from "./get-player-histories";
import { HistoriesTable } from "./histories-table";

export const PlayerGameHistories = async ({
  username,
  offset,
}: {
  username: string;
  offset: number;
}) => {
  const { playerHistories, playerHistoriesCount } = await getPlayerHistories(
    username,
    +(offset || "0"),
  );
  return (
    <HistoriesTable
      histories={playerHistories}
      playerHistoriesCount={playerHistoriesCount}
    />
  );
};
