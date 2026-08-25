import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class AuthenticationError extends Error { constructor() { super("You must sign in to continue."); } }
  class AuthorizationError extends Error { constructor() { super("You do not have permission to perform this action."); } }
  return {
    AuthenticationError,
    AuthorizationError,
    requirePermission: vi.fn(),
    createAdminStore: vi.fn(),
    listAdminStores: vi.fn(),
    createAdminCategory: vi.fn(),
    listAdminCategories: vi.fn(),
    createAdminProduct: vi.fn(),
    listAdminProducts: vi.fn(),
    getAdminOverviewMetrics: vi.fn(),
    parseCategoryInput: vi.fn((input) => input),
    parseProductInput: vi.fn((input) => input),
  };
});

vi.mock("@/lib/authz", () => ({ AuthenticationError: mocks.AuthenticationError, AuthorizationError: mocks.AuthorizationError, requirePermission: mocks.requirePermission }));
vi.mock("@/lib/admin/store-service", () => ({ createAdminStore: mocks.createAdminStore, listAdminStores: mocks.listAdminStores }));
vi.mock("@/lib/admin/catalogue-service", () => ({ createAdminCategory: mocks.createAdminCategory, listAdminCategories: mocks.listAdminCategories, createAdminProduct: mocks.createAdminProduct, listAdminProducts: mocks.listAdminProducts }));
vi.mock("@/lib/admin/catalogue-validation", () => ({ CatalogueValidationError: class CatalogueValidationError extends Error {}, parseCategoryInput: mocks.parseCategoryInput, parseProductInput: mocks.parseProductInput }));
vi.mock("@/lib/admin/store-validation", () => ({ StoreValidationError: class StoreValidationError extends Error {} }));
vi.mock("@/lib/orders/admin-metrics", () => ({ getAdminOverviewMetrics: mocks.getAdminOverviewMetrics }));
vi.mock("@/app/(protected)/dashboard/(grouped)/admin/admin-overview", () => ({ default: () => null }));

import { POST as createStore } from "@/app/api/admin/stores/route";
import { POST as createCategory } from "@/app/api/admin/categories/route";
import { POST as createProduct } from "@/app/api/admin/products/route";
import AdminDashboard from "@/app/(protected)/dashboard/(grouped)/admin/page";

const requests = [
  { name: "store", post: createStore, mutation: mocks.createAdminStore },
  { name: "category", post: createCategory, mutation: mocks.createAdminCategory },
  { name: "product", post: createProduct, mutation: mocks.createAdminProduct },
];

describe("admin mutation route authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(requests)("returns 401 without a session and does not mutate $name", async ({ post, mutation }) => {
    mocks.requirePermission.mockRejectedValue(new mocks.AuthenticationError());
    const response = await post(new Request("http://localhost/api/admin", { method: "POST", body: "{}" }));
    expect(response.status).toBe(401);
    expect(mutation).not.toHaveBeenCalled();
  });

  it.each(["USER", "CASHIER"])("returns 403 for a %s account and does not mutate", async () => {
    mocks.requirePermission.mockRejectedValue(new mocks.AuthorizationError());
    const response = await createProduct(new Request("http://localhost/api/admin/products", { method: "POST", body: "{}" }));
    expect(response.status).toBe(403);
    expect(mocks.createAdminProduct).not.toHaveBeenCalled();
  });

  it("uses the analytics permission before loading overview metrics", async () => {
    mocks.requirePermission.mockResolvedValue({ id: "admin", role: "ADMIN" });
    mocks.getAdminOverviewMetrics.mockResolvedValue({});

    await AdminDashboard();

    expect(mocks.requirePermission).toHaveBeenCalledWith({
      action: "view_all",
      resource: "analytics",
    });
    expect(mocks.getAdminOverviewMetrics).toHaveBeenCalledOnce();
  });
});
