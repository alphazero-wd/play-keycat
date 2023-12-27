import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "./signup-form";

test("should display signup form", async () => {
  const component = render(<SignupForm />);
  expect(component).toBeDefined();
});

describe("validation is not successful", () => {
  it("should show errors if username, email and password fields are empty", async () => {
    render(<SignupForm />);
    const signupButton = screen.getByText(/create account/i);
    await userEvent.click(signupButton);
    const usernameErrorMessage =
      await screen.findByText(/username is required/i);
    const emailErrorMessage = await screen.findByText(/email is required/i);
    const passwordErrorMessage =
      await screen.findByText(/password is required/i);
    expect(usernameErrorMessage).toBeInTheDocument();
    expect(emailErrorMessage).toBeInTheDocument();
    expect(passwordErrorMessage).toBeInTheDocument();
  });

  describe("and username is not valid", () => {
    it("should show an error if username is too long", async () => {
      render(<SignupForm />);
      const usernameInput = screen.getByLabelText(/username/i);
      const signupButton = screen.getByText(/create account/i);
      await userEvent.type(
        usernameInput,
        "dsajflakdsjflkajflkajslfjaldskfjalsfjaklsjflkadsfjlkajl",
      );
      await userEvent.click(signupButton);
      const usernameErrorMessage =
        await screen.findByText(/username is too long/i);
      expect(usernameErrorMessage).toBeInTheDocument();
    });

    it("should show an error if username is not valid (contains other special characters than _)", async () => {
      render(<SignupForm />);
      const usernameInput = screen.getByLabelText(/username/i);
      const signupButton = screen.getByText(/create account/i);
      await userEvent.type(usernameInput, "user@$*");
      await userEvent.click(signupButton);
      const usernameErrorMessage = await screen.findByText(
        /username can only contain letters, numbers and underscores \(_\)/i,
      );
      expect(usernameErrorMessage).toBeInTheDocument();
    });
  });

  describe("and email is not valid", () => {
    it("should show an error if email is not valid", async () => {
      render(<SignupForm />);
      const emailInput = screen.getByLabelText(/email/i);
      const signupButton = screen.getByText(/create account/i);
      await userEvent.type(emailInput, "abc@a");
      await userEvent.click(signupButton);
      const emailErrorMessage = await screen.findByText(/email is invalid/i);
      expect(emailErrorMessage).toBeInTheDocument();
    });
  });

  describe("and password is not valid", () => {
    it("should show an error if password is too weak", async () => {
      render(<SignupForm />);
      const passwordInput = screen.getByLabelText(/password/i);
      const signupButton = screen.getByText(/create account/i);
      await userEvent.type(passwordInput, "abcd1234");
      await userEvent.click(signupButton);
      const passwordErrorMessage = await screen.findByText(
        /password is not strong enough/i,
      );
      expect(passwordErrorMessage).toBeInTheDocument();
    });
  });
});
