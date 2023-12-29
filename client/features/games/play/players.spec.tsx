import { User } from "@/features/users/profile";
import { act, render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { checkTextInHTML } from "../../utils";
import { usePlayersStore } from "./hooks";
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
      gamesPlayed: 200,
      highestWpm: 120,
      joinedAt: new Date().toISOString(),
      lastTenAverageWpm: 109,
      rank: "Diamond IV",
      xpsGained: 3091,
      xpsRequired: 32767,
    },
    {
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
    },
    {
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
