import { CasualMode } from "./casual-mode";
import { PracticeMode } from "./practice-mode";
import { RankedMode } from "./ranked-mode";

export const GameModes = () => {
  return (
    <main className="grid gap-4 md:grid-cols-2">
      <RankedMode />
      <CasualMode />
      <PracticeMode />
    </main>
  );
};
