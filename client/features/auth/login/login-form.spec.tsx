import { Alert } from "@/features/ui/alert";
import { render, screen } from "@testing-library/react";
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
    render(<LoginForm />);
    const loginButton = screen.getByText(/log in/i);
    await userEvent.click(loginButton);
    const emailErrorMessage = await screen.findByText(/email is required/i);
    const passwordErrorMessage =
      await screen.findByText(/password is required/i);
    expect(emailErrorMessage).toBeInTheDocument();
    expect(passwordErrorMessage).toBeInTheDocument();
  });

  it("should show an error if email is not valid", async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const loginButton = screen.getByText(/log in/i);
    await userEvent.type(emailInput, "abc@a");
    await userEvent.click(loginButton);
    const emailErrorMessage = await screen.findByText(/email is invalid/i);
    expect(emailErrorMessage).toBeInTheDocument();
  });
});

describe("validation is successful, but login is not", () => {
  it("should display loading", async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByText(/log in/i);
    await userEvent.type(emailInput, "bob@bob.com");
    await userEvent.type(passwordInput, "123");
    await userEvent.click(loginButton);
    expect(emailInput).toHaveTextContent("");
    expect(passwordInput).toHaveTextContent("");
    expect(loginButton).toHaveTextContent(/logging in.../i);
  });

  it("should display error alert if email or password is incorrect", async () => {
    server.use(
      http.post("/auth/login", () => {
        return new HttpResponse(null, { status: 400 });
      }),
    );
    render(
      <>
        <Alert />
        <LoginForm />
      </>,
    );
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
});

describe("validation and login are successful", () => {
  it("should reset form and display loading if login successfully", async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByText(/log in/i);
    await userEvent.type(emailInput, "bob@bob.com");
    await userEvent.type(passwordInput, "123");
    await userEvent.click(loginButton);
    expect(emailInput).toHaveTextContent("");
    expect(passwordInput).toHaveTextContent("");
    expect(loginButton).toHaveTextContent(/logging in.../i);
  });
  it("should display success alert", async () => {
    render(
      <>
        <Alert />
        <LoginForm />
      </>,
    );
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
