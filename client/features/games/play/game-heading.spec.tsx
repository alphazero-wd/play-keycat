import { render, screen } from "@testing-library/react";
import { GameHeading } from "./game-heading";
import { useCountdown, useGameStore } from "./hooks";
import { GameMode } from "./types";

describe("when the game hasn't started", () => {
  it("shouldn't show \"Finding players\" if it's PRACTICE", () => {
    render(<GameHeading gameMode={GameMode.PRACTICE} />);
    expect(screen.queryByText(/finding players.../i)).toBeNull();
    expect(screen.getByText(/setting things up.../i)).toBeInTheDocument();
  });

  it('should show "Finding players" if it\'s not PRACTICE', () => {
    render(<GameHeading gameMode={GameMode.RANKED} />);
    expect(screen.getByText(/finding players.../i)).toBeInTheDocument();
  });
});

describe("when the first countdown has started", () => {
  it('should show "Game starting soonly" when the countdown is between 4-10 seconds', () => {
    useCountdown.setState({ countdown: 8 });
    render(<GameHeading gameMode={GameMode.RANKED} />);
    expect(screen.getByText(/game starting soonly.../i)).toBeInTheDocument();
  });

  it('should show "Headstart coming up" when there are fewer than 3 seconds remaining', () => {
    useCountdown.setState({ countdown: 3 });
    render(<GameHeading gameMode={GameMode.RANKED} />);
    expect(screen.getByText(/headstart coming up.../i)).toBeInTheDocument();
  });
});

describe("when the time limit has started", () => {
  it('should show "Game flared up" when there is plenty of time left', async () => {
    useCountdown.setState({ countdown: 100 });
    useGameStore.setState({ startedAt: "some time" });
    render(<GameHeading gameMode={GameMode.RANKED} />);
    expect(screen.getByText(/game flared up/i)).toBeInTheDocument();
  });

  it('should show "Game ending soonly" when there are 10 seconds remaining', async () => {
    useCountdown.setState({ countdown: 10 });
    useGameStore.setState({ startedAt: "some time" });
    render(<GameHeading gameMode={GameMode.RANKED} />);
    expect(screen.getByText(/game ending soonly/i)).toBeInTheDocument();
  });
});

describe("when the game has ended", () => {
  it('should show "Game ended" regardless of the time left', () => {
    useCountdown.setState({ countdown: 20 });
    useGameStore.setState({ startedAt: "some time", endedAt: "some time" });
    render(<GameHeading gameMode={GameMode.RANKED} />);
    expect(screen.getByText(/game ended/i)).toBeInTheDocument();
  });
});
