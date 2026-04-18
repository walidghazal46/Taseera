import { render, screen } from "@testing-library/react";

import App from "./App";

test("renders Taseera login screen", () => {
  render(<App />);
  expect(screen.getByText(/TAS'EERA/i)).toBeInTheDocument();
  expect(screen.getByText(/تسجيل الدخول/i)).toBeInTheDocument();
});
