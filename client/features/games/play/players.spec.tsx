import { User } from "@/features/users/profile";
import { act, render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { checkTextInHTML } from "../../utils";
import { useGameStore, usePlayersStore } from "./hooks";
import { Players } from "./players";
import { GameMode } from "./types";

let players: User[];

const handlers = [
  http.get("/users/:username/profile", ({ params }) => {
    const { username } = params;
    switch (username) {
      case "bob":
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
      case "tim":
        return HttpResponse.json({
          id: "2",
          username: "tim",
          catPoints: 2594,
          currentLevel: 92,
          gamesPlayed: 280,
          highestWpm: 96,
          joinedAt: new Date().toISOString(),
          lastTenAverageWpm: 92,
          rank: "Gold I",
          xpsGained: 1028,
          xpsRequired: 32767,
        });
      case "joe":
        return HttpResponse.json({
          id: "3",
          username: "joe",
          catPoints: 2894,
          currentLevel: 119,
          gamesPlayed: 295,
          highestWpm: 130,
          joinedAt: new Date().toISOString(),
          lastTenAverageWpm: 119,
          rank: "Diamond III",
          xpsGained: 23901,
          xpsRequired: 32767,
        });
    }
  }),
];

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  players = [
    {
      id: "1",
      username: "bob",
      catPoints: 2750,
      currentLevel: 101,
      rank: "Diamond IV",
      joinedAt: new Date().toISOString(),
      xpsGained: 3091,
      xpsRequired: 32767,
    },
    {
      id: "2",
      username: "tim",
      catPoints: 2594,
      currentLevel: 92,
      rank: "Gold I",
      joinedAt: new Date().toISOString(),
      xpsGained: 1028,
      xpsRequired: 32767,
    },
    {
      id: "3",
      username: "joe",
      catPoints: 2894,
      currentLevel: 119,
      rank: "Diamond III",
      joinedAt: new Date().toISOString(),
      xpsGained: 23901,
      xpsRequired: 32767,
    },
  ];
});

it("should render a list of players in a game, current player should be annotated", async () => {
  render(<Players userId="2" gameMode={GameMode.RANKED} />);
  act(() => usePlayersStore.setState({ players }));
  for (let player of players)
    expect(await screen.findByText("@" + player.username)).toBeInTheDocument();
  expect(
    await screen.findByText((_, node) => checkTextInHTML("@tim (you)", node)),
  ).toBeInTheDocument();
});

it("should fade out AFK players", async () => {
  render(<Players userId="2" gameMode={GameMode.RANKED} />);
  act(() =>
    usePlayersStore.setState({ players, leftPlayerIds: new Set(["1"]) }),
  );
  expect(screen.getByTestId("player-1")).toHaveClass("opacity-50");
});

it("should display progress and WPM", async () => {
  render(<Players userId="2" gameMode={GameMode.RANKED} />);
  act(() =>
    usePlayersStore.setState({
      players,
      playersProgress: new Map().set("2", 30),
      playersWpm: new Map().set("2", 120),
    }),
  );
  expect((await screen.findByText("T")).parentElement).toHaveStyle({
    transform: "translateX(300%)",
  });
  expect(
    await screen.findByText((_, node) => checkTextInHTML("120 WPM", node)),
  ).toBeInTheDocument();
});

it("should display position correctly", async () => {
  render(<Players userId="2" gameMode={GameMode.RANKED} />);
  act(() =>
    usePlayersStore.setState({
      players,
      playersPosition: new Map().set("2", 4),
    }),
  );
  expect(await screen.findByText("4th")).toBeInTheDocument();
});

it("should display a check if a player has finished a PRACTICE game", () => {
  render(<Players userId="2" gameMode={GameMode.PRACTICE} />);
  act(() => {
    useGameStore.setState({ hasFinished: true });
    usePlayersStore.setState({
      players: players.slice(0, 2),
    });
  });
  expect(screen.getAllByTitle("finished").length).toBe(2); // title tag + attribute in SVG
  expect(screen.queryByTitle("failed")).toBeNull();
});

it("should display a check if a player has finished a PRACTICE game", () => {
  render(<Players userId="2" gameMode={GameMode.PRACTICE} />);
  act(() => {
    useGameStore.setState({ hasFinished: false, endedAt: "some time" });
    usePlayersStore.setState({
      players: players.slice(0, 2),
    });
  });
  expect(screen.queryByTitle("finished")).toBeNull();
  expect(screen.getAllByTitle("failed").length).toBe(2);
});
