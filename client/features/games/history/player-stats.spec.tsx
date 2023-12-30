import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { GameMode } from "../play/types";
import { PlayerStats } from "./player-stats";
import { GameHistory } from "./types";

const handlers = [
  http.get("/users/:username/profile", () => {
    return HttpResponse.json({
      id: "1",
      username: "bob",
      catPoints: 2750,
      currentLevel: 101,
      gamesPlayed: 200,
      highestWpm: 120,
      joinedAt: new Date().toISOString(),
      lastTenAverageWpm: 109,
      rank: "Diamond IV",
      xpsGained: 3091,
      xpsRequired: 32767,
    });
  }),
];
const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

let histories: Omit<GameHistory, "game">[];
beforeEach(() => {
  histories = [
    {
      catPoints: 56,
      acc: 96,
      gameId: "1",
      player: { id: "1", username: "bob" },
      wpm: 120,
    },
    {
      catPoints: 43,
      acc: 94,
      gameId: "1",
      player: { id: "2", username: "bob" },
      wpm: 120,
    },
    {
      catPoints: 32,
      acc: 93,
      gameId: "1",
      player: { id: "3", username: "bob" },
      wpm: 110,
    },
    {
      catPoints: 32,
      acc: 93,
      gameId: "1",
      player: { id: "4", username: "bob" },
      wpm: 110,
    },
    {
      catPoints: 32,
      acc: 93,
      gameId: "1",
      player: { id: "5", username: "bob" },
      wpm: 90,
    },
    {
      catPoints: 32,
      acc: 93,
      gameId: "1",
      player: { id: "6", username: "bob" },
      wpm: 80,
    },
  ];
});

it("should display correct positions of all the players in descending order of WPM", () => {
  render(
    <PlayerStats userId="1" gameMode={GameMode.RANKED} histories={histories} />,
  );
  expect(screen.getAllByText("🥇").length).toBe(2);
  expect(screen.getAllByText("🥈").length).toBe(2);
  expect(screen.getByText("🥉")).toBeInTheDocument();
  expect(screen.getByText("4th")).toBeInTheDocument();
});
