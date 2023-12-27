import { Alert } from "@/features/ui/alert";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { SignupForm } from "./signup-form";

const handlers = [
  http.post("/auth/signup", () => {
    return HttpResponse.json({});
  }),

  http.post("/auth/login", () => {
    return HttpResponse.json({ username: "bob" });
  }),
];

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

describe("validation is successful", () => {
  it("should display loading and disable the button until response is received", async () => {
    render(<SignupForm />);
    const signupButton = screen.getByText(/create account/i);
    await userEvent.type(screen.getByLabelText(/username/i), "bob");
    await userEvent.type(screen.getByLabelText(/email/i), "bob@bob.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Bob123@");
    await userEvent.click(signupButton);
    expect(signupButton).toHaveTextContent(/creating account.../i);
    expect(signupButton).toBeDisabled();
    await waitFor(
      () => {
        expect(signupButton).toHaveTextContent(/create account/i);
        expect(signupButton).not.toBeDisabled();
      },
      { timeout: 3000 },
    );
  });

  it("should show error if username already exists", async () => {
    server.use(
      http.post("/auth/signup", () =>
        HttpResponse.json(
          { message: "username already exists" },
          { status: 400 },
        ),
      ),
    );
    render(<SignupForm />);
    const signupButton = screen.getByText(/create account/i);
    await userEvent.type(screen.getByLabelText(/username/i), "bob");
    await userEvent.type(screen.getByLabelText(/email/i), "bob@bob.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Bob123@");
    await userEvent.click(signupButton);
    await waitFor(
      async () => {
        expect(
          await screen.findByText(/username already exists/i),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should show error if email already exists", async () => {
    server.use(
      http.post("/auth/signup", () =>
        HttpResponse.json({ message: "email already exists" }, { status: 400 }),
      ),
    );
    render(<SignupForm />);
    const signupButton = screen.getByText(/create account/i);
    await userEvent.type(screen.getByLabelText(/username/i), "bob");
    await userEvent.type(screen.getByLabelText(/email/i), "bob@bob.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Bob123@");
    await userEvent.click(signupButton);
    await waitFor(
      async () => {
        expect(
          await screen.findByText(/email already exists/i),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should display alert and reset form when signing up successfully", async () => {
    const components = (
      <>
        <Alert />
        <SignupForm />
      </>
    );
    render(components);
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signupButton = screen.getByText(/create account/i);
    await userEvent.type(usernameInput, "bob");
    await userEvent.type(emailInput, "bob@bob.com");
    await userEvent.type(passwordInput, "Bob123@");
    await userEvent.click(signupButton);
    await waitFor(
      () => {
        expect(usernameInput).toHaveValue("");
        expect(emailInput).toHaveValue("");
        expect(passwordInput).toHaveValue("");
      },
      { timeout: 3000 },
    );
    expect(await screen.findByText(/Success/)).toBeInTheDocument();
    expect(
      await screen.findByText(/account created successfully/i),
    ).toBeInTheDocument();
  });
});
