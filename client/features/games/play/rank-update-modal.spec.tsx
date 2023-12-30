import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "../../ui/navbar/user-menu";
import { useRankUpdateModal } from "./hooks";
import { RankUpdateModal } from "./rank-update-modal";
import { RankUpdateStatus } from "./types";

it("should display rank promotion correctly", () => {
  useRankUpdateModal.setState({
    isModalOpen: true,
    currentRank: "Bronze IV",
    status: RankUpdateStatus.PROMOTED,
  });
  render(<RankUpdateModal />);
  expect(screen.getByText(/Rank Promotion/)).toBeInTheDocument();
  expect(screen.getByText(/You've been promoted/)).toBeInTheDocument();
  expect(screen.getByAltText("Bronze IV")).toBeInTheDocument();
});

it("should display rank demotion correctly", () => {
  useRankUpdateModal.setState({
    isModalOpen: true,
    currentRank: "Silver I",
    status: RankUpdateStatus.DEMOTED,
  });
  render(<RankUpdateModal />);
  expect(screen.getByText(/Rank Demotion/)).toBeInTheDocument();
  expect(screen.getByText(/You've been demoted/)).toBeInTheDocument();
  expect(screen.getByAltText("Silver I")).toBeInTheDocument();
});

it("should update the rank in the user menu", async () => {
  render(
    <>
      <UserMenu
        catPoints={490}
        currentLevel={2}
        rank="Unranked"
        username="bob"
        xpsGained={20}
        xpsRequired={110}
      />
      <RankUpdateModal />
    </>,
  );
  act(() =>
    useRankUpdateModal.setState({
      isModalOpen: true,
      currentRank: "Bronze IV",
      status: RankUpdateStatus.PROMOTED,
    }),
  );

  await userEvent.click(screen.getByTestId("user-menu-trigger"), {
    pointerEventsCheck: 0,
  });
  act(() => {
    useRankUpdateModal.setState({
      isModalOpen: false,
      currentRank: null,
      status: null,
    });
  });
  expect(await screen.findByAltText("Bronze IV")).toBeInTheDocument();
  expect(await screen.findByTestId("rank-label")).toHaveTextContent(
    "Bronze IV",
  );
});
