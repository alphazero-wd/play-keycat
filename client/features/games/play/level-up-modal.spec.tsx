import { UserMenu } from "@/features/ui/navbar/user-menu";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLevelUpModal } from "./hooks";
import { LevelUpModal } from "./level-up-modal";
import { GameMode } from "./types";

it("should display the level up modal and update the level in the menu", async () => {
  render(
    <>
      <UserMenu
        catPoints={30}
        currentLevel={1}
        rank="Unranked"
        username="bob"
        xpsGained={90}
        xpsRequired={100}
      />
      <LevelUpModal gameMode={GameMode.RANKED} />
    </>,
  );

  act(() =>
    useLevelUpModal.setState({
      isModalOpen: true,
      currentLevel: 2,
      xpsGained: 20,
      xpsRequired: 110,
    }),
  );
  await userEvent.click(screen.getByTestId("user-menu-trigger"), {
    pointerEventsCheck: 0,
  });
  expect(
    screen.getByText(/congrats, you've reached level 2/i),
  ).toBeInTheDocument();
  expect(await screen.findByText("20 / 110")).toBeInTheDocument();

  act(() => {
    useLevelUpModal.setState({
      isModalOpen: false,
      currentLevel: 1,
      xpsGained: 0,
      xpsRequired: 0,
    });
  });
  expect(await screen.findByTestId("profile-level")).toHaveTextContent("2");
  await waitFor(
    async () => {
      const progressIndicator = (await screen.findByRole("progressbar"))
        .children[0];
      expect(progressIndicator).toHaveStyle({
        transform: `translateX(-18.181818181818173%)`,
      });
    },
    { timeout: 500 },
  );
});
