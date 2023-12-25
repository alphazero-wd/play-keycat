import "@testing-library/jest-dom";

// Mock useRouter:
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: () => null,
      replace: () => null,
      refresh: () => null,
    };
  },
}));
