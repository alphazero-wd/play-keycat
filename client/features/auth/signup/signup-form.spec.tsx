import { render } from "@testing-library/react";
import { SignupForm } from "./signup-form";

test("should display signup form", async () => {
  const component = render(<SignupForm />);
  expect(component).toBeDefined();
});
