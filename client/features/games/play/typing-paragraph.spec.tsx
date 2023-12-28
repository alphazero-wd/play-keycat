import { render, screen } from "@testing-library/react";
import { GameMode } from "./types";
import { TypingParagraph } from "./typing-paragraph";

let paragraph: string;
let charsTyped: number;
beforeEach(() => {
  paragraph = "Hello, World!";
});

it("should highlight all the typed characters in green", () => {
  charsTyped = 5;
  render(
    <TypingParagraph
      charsTyped={charsTyped}
      prevError={null}
      gameMode={GameMode.RANKED}
      paragraph={paragraph}
    />,
  );

  for (let i = 0; i < charsTyped; i++)
    expect(screen.getByTestId(i.toString())).toHaveClass(
      "text-green-700",
      "bg-green-100",
      "dark:bg-green-200",
    );
});

it("should highlight the typo in red", () => {
  charsTyped = 6;
  render(
    <TypingParagraph
      charsTyped={charsTyped}
      prevError={charsTyped - 1}
      gameMode={GameMode.RANKED}
      paragraph={paragraph}
    />,
  );
  for (let i = 0; i < charsTyped - 1; i++)
    expect(screen.getByTestId(i.toString())).toHaveClass(
      "text-green-700",
      "bg-green-100",
      "dark:bg-green-200",
    );

  expect(screen.getByTestId((charsTyped - 1).toString())).toHaveClass(
    "text-red-700",
    "bg-red-100",
    "dark:bg-red-200",
  );
});

describe("testing the current character cursor", () => {
  it("should show the underline below the current character to type", () => {
    charsTyped = 3;
    render(
      <TypingParagraph
        charsTyped={charsTyped}
        prevError={null}
        gameMode={GameMode.RANKED}
        paragraph={paragraph}
      />,
    );

    expect(screen.getByTestId(charsTyped.toString())).toHaveClass("border-b-4");
  });

  it("should color the underline cyan if it's a RANKED game", () => {
    charsTyped = 3;
    render(
      <TypingParagraph
        charsTyped={charsTyped}
        prevError={null}
        gameMode={GameMode.RANKED}
        paragraph={paragraph}
      />,
    );

    expect(screen.getByTestId(charsTyped.toString())).toHaveClass(
      "border-primary",
      "text-primary",
    );
  });

  it("should color the underline blue if it's a CASUAL game", () => {
    charsTyped = 3;
    render(
      <TypingParagraph
        charsTyped={charsTyped}
        prevError={null}
        gameMode={GameMode.CASUAL}
        paragraph={paragraph}
      />,
    );

    expect(screen.getByTestId(charsTyped.toString())).toHaveClass(
      "border-blue-600",
      "dark:border-blue-300",
      "text-blue-600",
      "dark:text-blue-300",
    );
  });

  it("should color the underline purple if it's a PRACTICE game", () => {
    charsTyped = 3;
    render(
      <TypingParagraph
        charsTyped={charsTyped}
        prevError={null}
        gameMode={GameMode.PRACTICE}
        paragraph={paragraph}
      />,
    );

    expect(screen.getByTestId(charsTyped.toString())).toHaveClass(
      "border-purple-600",
      "dark:border-purple-300",
      "text-purple-600",
      "dark:text-purple-300",
    );
  });
});
