import { Alert } from "@/features/ui/alert";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { LoginForm } from "./login-form";

const handlers = [
  http.post("/auth/login", () => {
    return HttpResponse.json({ username: "bob" });
  }),
];
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("should display login form", async () => {
  const component = render(<LoginForm />);
  expect(component).toBeDefined();
});

describe("validation is not successful", () => {
  it("should show errors if email and password fields are empty", async () => {
    const screen = render(<LoginForm />);
    const loginButton = screen.getByText(/log in/i);
    await userEvent.click(loginButton);
    const emailErrorMessage = await screen.findByText(/email is required/i);
    const passwordErrorMessage =
      await screen.findByText(/password is required/i);
    expect(emailErrorMessage).toBeInTheDocument();
    expect(passwordErrorMessage).toBeInTheDocument();
  });

  it("should show an error if email is not valid", async () => {
    const screen = render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const loginButton = screen.getByText(/log in/i);
    await userEvent.type(emailInput, "abc@a");
    await userEvent.click(loginButton);
    const emailErrorMessage = await screen.findByText(/email is invalid/i);
    expect(emailErrorMessage).toBeInTheDocument();
  });
});

describe("validation is successful", () => {
  it("should display loading and disable the button until response is received", async () => {
    const screen = render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByText(/log in/i);
    await userEvent.type(emailInput, "bob@bob.com");
    await userEvent.type(passwordInput, "123");
    await userEvent.click(loginButton);
    expect(loginButton).toHaveTextContent(/logging in.../i);
    expect(loginButton).toBeDisabled();

    await waitFor(
      () => {
        expect(loginButton).toHaveTextContent(/log in/i);
        expect(loginButton).not.toBeDisabled();
      },
      { timeout: 2000 }, // 1 second delay + time for promise to be fulfilled > 1s
    );
  });

  describe("and log in is not successful", () => {
    it("should display error alert if email or password is incorrect", async () => {
      const components = (
        <>
          <Alert />
          <LoginForm />
        </>
      );
      server.use(
        http.post("/auth/login", () => {
          return new HttpResponse(null, { status: 400 });
        }),
      );
      const screen = render(components);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByText(/log in/i);
      await userEvent.type(emailInput, "bob@bob.com");
      await userEvent.type(passwordInput, "123");
      await userEvent.click(loginButton);
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(await screen.findByText(/error/i)).toBeInTheDocument();
      const alertContent = await screen.findByText(
        /wrong email or password provided/i,
      );
      expect(alertContent).toBeInTheDocument();
    });

    it("should display error alert if some unexpected error occur", async () => {
      const components = (
        <>
          <Alert />
          <LoginForm />
        </>
      );
      server.use(
        http.post("/auth/login", () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );
      const screen = render(components);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByText(/log in/i);
      await userEvent.type(emailInput, "bob@bob.com");
      await userEvent.type(passwordInput, "123");
      await userEvent.click(loginButton);
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(await screen.findByText(/error/i)).toBeInTheDocument();
      const alertContent = await screen.findByText(/something went wrong/i);
      expect(alertContent).toBeInTheDocument();
    });
  });

  describe("and login are successful", () => {
    it("should reset form if login successfully", async () => {
      const screen = render(<LoginForm />);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByText(/log in/i);
      await userEvent.type(emailInput, "bob@bob.com");
      await userEvent.type(passwordInput, "123");
      await userEvent.click(loginButton);

      await waitFor(
        () => {
          expect(emailInput).toHaveValue("");
          expect(passwordInput).toHaveValue("");
        },
        { timeout: 2000 },
      );
    });
    it("should display success alert", async () => {
      const components = (
        <>
          <Alert />
          <LoginForm />
        </>
      );
      const screen = render(components);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByText(/log in/i);
      await userEvent.type(emailInput, "bob@bob.com");
      await userEvent.type(passwordInput, "123");
      await userEvent.click(loginButton);
      expect(await screen.findByRole("alert")).toBeInTheDocument();
      expect(await screen.findByText(/success/i)).toBeInTheDocument();
      expect(await screen.findByText(/welcome back, bob/i)).toBeInTheDocument();
    });
  });
});
