import { expect, test } from "@playwright/test";

const admin = { email: "admin@coffeeshop.com", password: "Admin123!" };
const cashier = { email: "cashier@coffeeshop.com", password: "Cashier123!" };
const customer = { email: "customer@coffeeshop.com", password: "Customer123!" };

async function login(page: import("@playwright/test").Page, account: typeof admin, callbackUrl = "/dashboard/admin/stores") {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email Address").fill(account.email);
  await page.getByRole("textbox", { name: "Password" }).fill(account.password);
  await page.getByRole("button", { name: "Login" }).click();
}

test("guest is redirected to sign in before entering store administration", async ({ page }) => {
  await page.goto("/dashboard/admin/stores");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard%2Fadmin%2Fstores/);
});

test("administrator can enter the store administration screen", async ({ page }) => {
  await login(page, admin);
  await expect(page).toHaveURL(/\/dashboard\/admin\/stores/);
  await expect(page.getByRole("heading", { name: "Store locations" })).toBeVisible();
});

test("cashier cannot enter the store administration screen", async ({ page }) => {
  await login(page, cashier);
  await expect(page).toHaveURL(/\/unauthorized/);
});

test("customer can view a responsive order history", async ({ page }) => {
  await login(page, customer, "/dashboard/orders");
  await expect(page).toHaveURL(/\/dashboard\/orders/);
  await expect(page.getByRole("heading", { name: "Order history" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Order history filters" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Active" })).toBeVisible();
});
