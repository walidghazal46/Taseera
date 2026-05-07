import { fireEvent, render, screen } from "@testing-library/react";

import App from "./App";

test("renders Taseera login screen", () => {
  render(<App />);
  expect(screen.getByAltText(/Taseera/i)).toBeInTheDocument();
  expect(screen.getAllByText(/تسجيل الدخول/i).length).toBeGreaterThan(0);
});

test("prevents authenticated entry without credentials", () => {
  render(<App />);

  fireEvent.click(screen.getAllByText(/تسجيل الدخول/i)[1]);

  expect(screen.getByText(/البريد الإلكتروني وكلمة المرور مطلوبان/i)).toBeInTheDocument();
});

test("allows guest entry to the main workspace", () => {
  render(<App />);

  fireEvent.click(screen.getByText(/الدخول كضيف/i));

  expect(screen.getAllByText(/الشركات/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/الموردين/i).length).toBeGreaterThan(0);
});
