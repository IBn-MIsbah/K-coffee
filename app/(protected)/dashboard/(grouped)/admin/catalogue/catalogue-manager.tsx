"use client";

import {
  Archive,
  FolderPlus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Tags,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/actions/upload";
import {
  categoryFormSchema,
  productFormSchema,
  toFormErrors,
  type FormErrors,
} from "@/lib/admin/form-schemas";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { products: number };
};
type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  category: { id: string; name: string; isActive: boolean };
};
type CategoryForm = { name: string; slug: string };
type ProductForm = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
  isActive: boolean;
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-[#dfc6a9] bg-white px-3 text-[#3b2116] shadow-sm outline-none transition focus:border-[#a56328] focus:ring-2 focus:ring-[#f5dfba]";
const blankCategory = (): CategoryForm => ({ name: "", slug: "" });
const blankProduct = (): ProductForm => ({
  name: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
  isActive: true,
});

export default function CatalogueManager({
  initialCategories,
  initialProducts,
}: {
  initialCategories: Category[];
  initialProducts: Product[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [categoryForm, setCategoryForm] = useState(blankCategory);
  const [productForm, setProductForm] = useState(blankProduct);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"category" | "product" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [categoryErrors, setCategoryErrors] = useState<
    FormErrors<CategoryForm>
  >({});
  const [productErrors, setProductErrors] = useState<FormErrors<ProductForm>>(
    {},
  );
  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );

  function beginCategory(category?: Category) {
    setError("");
    setCategoryErrors({});
    setEditingCategoryId(category?.id ?? null);
    setCategoryForm(
      category ? { name: category.name, slug: category.slug } : blankCategory(),
    );
  }
  function beginProduct(product?: Product) {
    setError("");
    setProductErrors({});
    setEditingProductId(product?.id ?? null);
    setProductForm(
      product
        ? {
            name: product.name,
            description: product.description ?? "",
            price: product.price,
            categoryId: product.category.id,
            imageUrl: product.imageUrl ?? "",
            isActive: product.isActive,
          }
        : blankProduct(),
    );
  }
  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error ?? "Unable to save changes.");
    return result;
  }
  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = categoryFormSchema.safeParse(categoryForm);
    if (!parsed.success) {
      setCategoryErrors(toFormErrors(parsed.error));
      toast.error("Check the category form", {
        description: "Correct the highlighted fields and try again.",
      });
      return;
    }
    setBusy("category");
    setError("");
    setCategoryErrors({});
    try {
      const result = await request(
        editingCategoryId
          ? `/api/admin/categories/${editingCategoryId}`
          : "/api/admin/categories",
        editingCategoryId ? "PATCH" : "POST",
        parsed.data,
      );
      const category = result.category as Category;
      setCategories((current) =>
        editingCategoryId
          ? current.map((item) => (item.id === category.id ? category : item))
          : [category, ...current],
      );
      beginCategory();
      toast.success(
        editingCategoryId ? "Category updated" : "Category created",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save the category.",
      );
      toast.error("Category could not be saved", {
        description:
          cause instanceof Error ? cause.message : "Try again shortly.",
      });
    } finally {
      setBusy(null);
    }
  }
  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = productFormSchema.safeParse(productForm);
    if (!parsed.success) {
      setProductErrors(toFormErrors(parsed.error));
      toast.error("Check the product form", {
        description: "Correct the highlighted fields and try again.",
      });
      return;
    }
    setBusy("product");
    setError("");
    setProductErrors({});
    try {
      const result = await request(
        editingProductId
          ? `/api/admin/products/${editingProductId}`
          : "/api/admin/products",
        editingProductId ? "PATCH" : "POST",
        {
          ...parsed.data,
          description: parsed.data.description || null,
          imageUrl: parsed.data.imageUrl || null,
        },
      );
      const product = result.product as Product;
      setProducts((current) =>
        editingProductId
          ? current.map((item) => (item.id === product.id ? product : item))
          : [product, ...current],
      );
      beginProduct();
      toast.success(editingProductId ? "Product updated" : "Product created");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save the product.",
      );
      toast.error("Product could not be saved", {
        description:
          cause instanceof Error ? cause.message : "Try again shortly.",
      });
    } finally {
      setBusy(null);
    }
  }
  async function uploadProductImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const image = event.target.files?.[0];
    if (!image) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("image", image);
      const { url } = await uploadImage(formData);
      setProductForm((current) => ({ ...current, imageUrl: url }));
      setProductErrors((current) => ({ ...current, imageUrl: undefined }));
      toast.success("Image uploaded", {
        description: "It will be attached when you save the product.",
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to upload the image.",
      );
      toast.error("Image upload failed", {
        description:
          cause instanceof Error
            ? cause.message
            : "Choose another image and try again.",
      });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  async function changeCategoryStatus(category: Category) {
    if (
      category.isActive &&
      !window.confirm(
        `Archive ${category.name}? Active products must be moved or archived first.`,
      )
    )
      return;
    setBusy("category");
    setError("");
    try {
      const result = await request(
        `/api/admin/categories/${category.id}/${category.isActive ? "archive" : "restore"}`,
        "POST",
      );
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? result.category : item,
        ),
      );
      toast.success(
        category.isActive ? "Category archived" : "Category restored",
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update the category.",
      );
      toast.error("Category status could not be changed", {
        description:
          cause instanceof Error ? cause.message : "Try again shortly.",
      });
    } finally {
      setBusy(null);
    }
  }
  async function changeProductStatus(product: Product) {
    if (
      product.isActive &&
      !window.confirm(
        `Archive ${product.name}? It will disappear from the customer menu.`,
      )
    )
      return;
    setBusy("product");
    setError("");
    try {
      const result = await request(
        `/api/admin/products/${product.id}/${product.isActive ? "archive" : "restore"}`,
        "POST",
      );
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? result.product : item)),
      );
      toast.success(product.isActive ? "Product archived" : "Product restored");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update the product.",
      );
      toast.error("Product status could not be changed", {
        description:
          cause instanceof Error ? cause.message : "Try again shortly.",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-7">
      <header>
        <p className="text-sm font-semibold text-amber-700">Administration</p>
        <h1 className="mt-1 text-3xl font-bold text-amber-950">Catalogue</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Maintain customer-facing categories and products. Archive records
          instead of deleting them so completed orders keep their original
          details.
        </p>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800"
        >
          {error}
        </p>
      )}
      <div className="grid gap-7 xl:grid-cols-[.85fr_1.15fr]">
        <section className="rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-amber-950">Categories</h2>
              <p className="mt-1 text-sm text-slate-600">
                A category must be active before a product can use it.
              </p>
            </div>
            <Tags aria-hidden="true" className="size-5 text-amber-700" />
          </div>
          <form onSubmit={saveCategory} className="mt-6 grid gap-4">
            <Field label="Category name" error={categoryErrors.name}>
              <input
                aria-invalid={Boolean(categoryErrors.name)}
                aria-describedby={
                  categoryErrors.name ? "category-name-error" : undefined
                }
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="URL slug" error={categoryErrors.slug}>
              <input
                aria-invalid={Boolean(categoryErrors.slug)}
                aria-describedby={
                  categoryErrors.slug ? "category-slug-error" : undefined
                }
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    slug: event.target.value.toLowerCase(),
                  }))
                }
                placeholder="espresso-drinks"
                className={inputClass}
              />
              <span className="text-xs font-normal text-slate-500">
                Lowercase letters, numbers, and hyphens.
              </span>
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={busy !== null}
                className="min-h-11 rounded-full bg-amber-700 text-white hover:bg-amber-800"
              >
                {editingCategoryId ? (
                  <Save aria-hidden="true" />
                ) : (
                  <FolderPlus aria-hidden="true" />
                )}
                {busy === "category"
                  ? "Saving…"
                  : editingCategoryId
                    ? "Save category"
                    : "Add category"}
              </Button>
              {editingCategoryId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => beginCategory()}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
          <div className="mt-7 divide-y border-t border-[#ead9bf]">
            {categories.map((category) => (
              <article
                key={category.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-amber-950">
                      {category.name}
                    </h3>
                    <Status active={category.isActive} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    /{category.slug} · {category._count.products} products
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => beginCategory(category)}
                  >
                    <Pencil aria-hidden="true" /> Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    className={
                      category.isActive
                        ? "border-red-200 text-red-800 hover:bg-red-50"
                        : ""
                    }
                    onClick={() => changeCategoryStatus(category)}
                  >
                    {category.isActive ? (
                      <Archive aria-hidden="true" />
                    ) : (
                      <RotateCcw aria-hidden="true" />
                    )}
                    {category.isActive ? "Archive" : "Restore"}
                  </Button>
                </div>
              </article>
            ))}
            {!categories.length && (
              <p className="py-6 text-sm text-slate-600">
                Create the first category before adding a product.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-3xl border border-[#ead9bf] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-amber-950">Products</h2>
              <p className="mt-1 text-sm text-slate-600">
                Prices are in ETB. An archived product is never shown or
                orderable by customers.
              </p>
            </div>
            <Plus aria-hidden="true" className="size-5 text-amber-700" />
          </div>
          <form
            onSubmit={saveProduct}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <Field label="Product name" error={productErrors.name}>
              <input
                aria-invalid={Boolean(productErrors.name)}
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Category" error={productErrors.categoryId}>
              <select
                aria-invalid={Boolean(productErrors.categoryId)}
                value={productForm.categoryId}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">Choose a category</option>
                {activeCategories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Price (ETB)" error={productErrors.price}>
              <input
                inputMode="decimal"
                value={productForm.price}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="85.00"
                className={inputClass}
              />
            </Field>
            <Field label="Image URL (optional)" error={productErrors.imageUrl}>
              <input
                type="url"
                aria-invalid={Boolean(productErrors.imageUrl)}
                value={productForm.imageUrl}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
                placeholder="https://…"
                className={inputClass}
              />
            </Field>
            <Field label="Upload image (optional)">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={uploadProductImage}
                disabled={uploading}
                className={`${inputClass} cursor-pointer py-2`}
              />
              <span className="text-xs font-normal text-slate-500">
                JPEG, PNG, WebP, or AVIF · 5 MB maximum.{" "}
                {uploading
                  ? "Uploading…"
                  : productForm.imageUrl
                    ? "Image attached."
                    : ""}
              </span>
            </Field>
            <Field
              label="Description"
              error={productErrors.description}
              className="sm:col-span-2"
            >
              <textarea
                aria-invalid={Boolean(productErrors.description)}
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                maxLength={1000}
                className={`${inputClass} min-h-24 py-3`}
              />
            </Field>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#3b2116]">
              <input
                type="checkbox"
                checked={productForm.isActive}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />{" "}
              Active and visible to customers
            </label>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button
                disabled={
                  busy !== null || uploading || !activeCategories.length
                }
                className="min-h-11 rounded-full bg-amber-700 text-white hover:bg-amber-800"
              >
                {editingProductId ? (
                  <Save aria-hidden="true" />
                ) : (
                  <Plus aria-hidden="true" />
                )}
                {busy === "product"
                  ? "Saving…"
                  : editingProductId
                    ? "Save product"
                    : "Add product"}
              </Button>
              {editingProductId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => beginProduct()}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
          <div className="mt-7 divide-y border-t border-[#ead9bf]">
            {products.map((product) => (
              <article
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-amber-950">{product.name}</h3>
                    <Status active={product.isActive} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {product.category.name} ·{" "}
                    <span className="tabular-nums">ETB {product.price}</span>
                  </p>
                  {product.description && (
                    <p className="mt-1 max-w-xl text-sm text-slate-500">
                      {product.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    onClick={() => beginProduct(product)}
                  >
                    <Pencil aria-hidden="true" /> Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy !== null}
                    className={
                      product.isActive
                        ? "border-red-200 text-red-800 hover:bg-red-50"
                        : ""
                    }
                    onClick={() => changeProductStatus(product)}
                  >
                    {product.isActive ? (
                      <Archive aria-hidden="true" />
                    ) : (
                      <RotateCcw aria-hidden="true" />
                    )}
                    {product.isActive ? "Archive" : "Restore"}
                  </Button>
                </div>
              </article>
            ))}
            {!products.length && (
              <p className="py-6 text-sm text-slate-600">
                No products yet. Add an item after creating its category.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
  className = "",
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <label
      className={`grid gap-2 text-sm font-semibold text-[#3b2116] ${className}`}
    >
      <span>{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-sm font-medium text-red-700">
          {error}
        </span>
      )}
    </label>
  );
}
function Status({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
    >
      {active ? "Active" : "Archived"}
    </span>
  );
}
