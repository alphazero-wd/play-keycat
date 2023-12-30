import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "../../ui/navbar/user-menu";
import { GameSummaryModal } from "./game-summary-modal";
import { useGameSummaryModal } from "./hooks";
import { GameMode } from "./types";

let payload: Omit<
  ReturnType<typeof useGameSummaryModal.getState>,
  "onOpen" | "onClose"
>;

beforeEach(() => {
  payload = {
    acc: 95,
    wpm: 120,
    catPoints: 30,
    isModalOpen: true,
    position: 1,
    newXPsGained: 60,
    totalXPsBonus: 200,
  };
});
describe("test the appearance of the modal", () => {
  it("should show the summary if isModalOpen is true", async () => {
    useGameSummaryModal.setState(payload);
    render(<GameSummaryModal gameMode={GameMode.RANKED} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("shouldn't show the summary if isModalOpen is false", () => {
    useGameSummaryModal.setState({ ...payload, isModalOpen: false });
    render(<GameSummaryModal gameMode={GameMode.RANKED} />);
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });
});

describe("test the display of the summary stats", () => {
  it("should show all the stats if game mode is not PRACTICE", () => {
    useGameSummaryModal.setState(payload);
    render(<GameSummaryModal gameMode={GameMode.RANKED} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("🥇")).toBeInTheDocument();
    expect(screen.getByText("+200 XP")).toBeInTheDocument();
    expect(screen.getByTestId("plus")).toHaveTextContent("30");
  });

  it("should show all the stats except position in PRACTICE game", () => {
    useGameSummaryModal.setState({
      isModalOpen: true,
      acc: payload.acc,
      wpm: payload.wpm,
      position: 1,
    });
    render(<GameSummaryModal gameMode={GameMode.PRACTICE} />);
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.queryByText("🥇")).toBeNull();
    expect(screen.getByText("+0 XP")).toBeInTheDocument();
    expect(screen.getByTestId("zero")).toHaveTextContent("0");
  });

  it("should show correct ordinal position (from the 4th) and the absolute of catPoints if it's negative", () => {
    useGameSummaryModal.setState({
      isModalOpen: true,
      position: 4,
      catPoints: -12,
    });
    render(<GameSummaryModal gameMode={GameMode.RANKED} />);
    expect(screen.getByText("4th")).toBeInTheDocument();
    expect(screen.getByTestId("minus")).toHaveTextContent("12");
  });
});

describe("test the update of CPs and XPs", () => {
  it("should update the CPs and XPs in the user menu", async () => {
    render(
      <>
        <UserMenu
          rank="Unranked"
          catPoints={30}
          currentLevel={1}
          username="bob"
          xpsGained={10}
          xpsRequired={100}
        />
        <GameSummaryModal gameMode={GameMode.RANKED} />
      </>,
    );
    act(() => useGameSummaryModal.setState(payload));
    await userEvent.click(screen.getByTestId("user-menu-trigger"), {
      pointerEventsCheck: 0,
    });
    // reset state to guarantee permanent update in the menu
    act(() => {
      useGameSummaryModal.setState({
        acc: undefined,
        catPoints: undefined,
        isModalOpen: false,
        newXPsGained: undefined,
        position: undefined,
        totalXPsBonus: undefined,
        wpm: undefined,
      });
    });

    expect(await screen.findByText(/60 cps/i)).toBeInTheDocument();
    await waitFor(
      async () => {
        const progressIndicator = (await screen.findByRole("progressbar"))
          .children[0];
        expect(progressIndicator).toHaveStyle({
          transform: "translateX(-40%)",
        });
      },
      { timeout: 500 },
    );
  });
});
