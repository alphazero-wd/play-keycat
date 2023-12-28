import { render, screen } from "@testing-library/react";
import { GameSubheading } from "./game-subheading";
import { useCountdown, useGameStore } from "./hooks";
import { GameMode } from "./types";

describe("when the game hasn't started", () => {
  it("shouldn't show \"waiting for opponents...\" if it's PRACTICE", () => {
    render(<GameSubheading gameMode={GameMode.PRACTICE} />);
    expect(
      screen.queryByText(/waiting for opponents with similar levels.../i),
    ).toBeNull();
    expect(
      screen.getByText(
        /wait while we prepare a solo practice environment for you.../i,
      ),
    ).toBeInTheDocument();
  });

  it('should show "waiting for opponents..." if it\'s not PRACTICE', () => {
    render(<GameSubheading gameMode={GameMode.RANKED} />);
    expect(
      screen.getByText(/waiting for opponents with similar levels.../i),
    ).toBeInTheDocument();
  });
});

describe("when the first countdown has started", () => {
  it('should show "game starting in ... seconds"', () => {
    useCountdown.setState({ countdown: 8 });
    render(<GameSubheading gameMode={GameMode.RANKED} />);
    expect(
      screen.getByText(/game starting in 8 seconds.../i),
    ).toBeInTheDocument();
  });
});

describe("when the time limit has started", () => {
  it("should show time remaining when there is plenty of time left", async () => {
    useCountdown.setState({ countdown: 100 });
    useGameStore.setState({ startedAt: "some time" });
    render(<GameSubheading gameMode={GameMode.RANKED} />);
    expect(screen.getByText(/time remaining 01:40/i)).toBeInTheDocument();
  });
});

describe("when the game has ended", () => {
  it('should show "Game has ended" regardless of the time left', () => {
    useCountdown.setState({ countdown: 100 });
    useGameStore.setState({ startedAt: "some time", endedAt: "some time" });
    render(<GameSubheading gameMode={GameMode.RANKED} />);
    expect(
      screen.getByText(
        /game has ended. Have a look at the history or, maybe another game\?/i,
      ),
    ).toBeInTheDocument();
  });
});
