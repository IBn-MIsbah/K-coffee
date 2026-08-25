"use client";

import {
  Archive,
  CheckCircle2,
  CircleAlert,
  FolderPlus,
  ImagePlus,
  Layers3,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Tags,
} from "lucide-react";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uploadImage } from "@/lib/actions/upload";
import {
  categoryFormSchema,
  productFormSchema,
  toFormErrors,
  type FormErrors,
} from "@/lib/admin/form-schemas";
import { cn } from "@/lib/utils";

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
type FormMode = "category" | "product";
type ProductStatus = "active" | "archived" | "all";
type ArchiveTarget =
  | { kind: "category"; record: Category }
  | { kind: "product"; record: Product };
type CategorySummary = {
  category: Category;
  totalCount: number;
  activeCount: number;
  archivedCount: number;
};

const inputClass =
  "min-h-11 w-full rounded-2xl border border-[#dfc6a9] bg-white/80 px-3.5 text-base text-[#3b2116] shadow-sm outline-none transition placeholder:text-[#9b806d] focus:border-[#a56328] focus:ring-2 focus:ring-[#f5dfba] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

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
  const [editingProductId, setEditingProductId] = useState<string | null>(
    null,
  );
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [categoryPreviewId, setCategoryPreviewId] = useState<string | null>(
    null,
  );
  const [archiveTarget, setArchiveTarget] = useState<ArchiveTarget | null>(
    null,
  );
  const [busy, setBusy] = useState<"category" | "product" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [categoryErrors, setCategoryErrors] = useState<
    FormErrors<CategoryForm>
  >({});
  const [productErrors, setProductErrors] = useState<FormErrors<ProductForm>>(
    {},
  );
  const [productQuery, setProductQuery] = useState("");
  const [productStatus, setProductStatus] = useState<ProductStatus>("active");
  const [productCategoryId, setProductCategoryId] = useState("all");

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );
  const categorySummaries = useMemo(
    () =>
      categories.map((category) => {
        const items = products.filter(
          (product) => product.category.id === category.id,
        );
        return {
          category,
          totalCount: items.length,
          activeCount: items.filter((product) => product.isActive).length,
          archivedCount: items.filter((product) => !product.isActive).length,
        };
      }),
    [categories, products],
  );
  const previewCategory = useMemo(
    () =>
      categories.find((category) => category.id === categoryPreviewId) ?? null,
    [categories, categoryPreviewId],
  );
  const previewProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.category.id === previewCategory?.id &&
          product.isActive &&
          previewCategory?.isActive,
      ),
    [previewCategory, products],
  );
  const visibleProducts = useMemo(() => {
    const query = productQuery.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const matchesStatus =
        productStatus === "all" ||
        (productStatus === "active" ? product.isActive : !product.isActive);
      const matchesCategory =
        productCategoryId === "all" ||
        product.category.id === productCategoryId;
      const matchesQuery =
        !query ||
        [product.name, product.category.name, product.description ?? ""]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query);
      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [productCategoryId, productQuery, productStatus, products]);

  const publishedProductCount = products.filter(
    (product) =>
      product.isActive &&
      categories.some(
        (category) =>
          category.id === product.category.id && category.isActive,
      ),
  ).length;
  const archivedItemCount =
    categories.filter((category) => !category.isActive).length +
    products.filter((product) => !product.isActive).length;
  const hasProductFilters =
    productQuery.trim().length > 0 ||
    productStatus !== "active" ||
    productCategoryId !== "all";

  function resetCategoryForm() {
    setEditingCategoryId(null);
    setCategoryErrors({});
    setCategoryForm(blankCategory());
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductErrors({});
    setProductForm(blankProduct());
  }

  function openCategoryForm(category?: Category) {
    setError("");
    setCategoryErrors({});
    setEditingCategoryId(category?.id ?? null);
    setCategoryForm(
      category ? { name: category.name, slug: category.slug } : blankCategory(),
    );
    setFormMode("category");
  }

  function openProductForm(product?: Product, categoryId?: string) {
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
        : {
            ...blankProduct(),
            categoryId: categoryId ?? activeCategories[0]?.id ?? "",
          },
    );
    setFormMode("product");
  }

  function closeFormDialog() {
    if (busy || uploading) return;
    setFormMode(null);
    setError("");
    resetCategoryForm();
    resetProductForm();
  }

  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        typeof result.error === "string"
          ? result.error
          : "The request could not be completed. Please try again.",
      );
    }
    return result;
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = categoryFormSchema.safeParse(categoryForm);
    if (!parsed.success) {
      setCategoryErrors(toFormErrors(parsed.error));
      toast.error("Check the category form", {
        description: "Correct the highlighted fields and try again.",
      });
      return;
    }

    const id = editingCategoryId;
    setBusy("category");
    setError("");
    setCategoryErrors({});
    try {
      const result = await request(
        id ? "/api/admin/categories/" + id : "/api/admin/categories",
        id ? "PATCH" : "POST",
        parsed.data,
      );
      const category = result.category as Category;
      setCategories((current) =>
        id
          ? current.map((item) => (item.id === category.id ? category : item))
          : [category, ...current],
      );
      toast.success(id ? "Category updated" : "Category created");
      setFormMode(null);
      resetCategoryForm();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unable to save the category.";
      setError(message);
      toast.error("Category could not be saved", { description: message });
    } finally {
      setBusy(null);
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = productFormSchema.safeParse(productForm);
    if (!parsed.success) {
      setProductErrors(toFormErrors(parsed.error));
      toast.error("Check the product form", {
        description: "Correct the highlighted fields and try again.",
      });
      return;
    }

    const id = editingProductId;
    setBusy("product");
    setError("");
    setProductErrors({});
    try {
      const result = await request(
        id ? "/api/admin/products/" + id : "/api/admin/products",
        id ? "PATCH" : "POST",
        {
          ...parsed.data,
          description: parsed.data.description || null,
          imageUrl: parsed.data.imageUrl || null,
        },
      );
      const product = result.product as Product;
      setProducts((current) =>
        id
          ? current.map((item) => (item.id === product.id ? product : item))
          : [product, ...current],
      );
      toast.success(id ? "Product updated" : "Product created");
      setFormMode(null);
      resetProductForm();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unable to save the product.";
      setError(message);
      toast.error("Product could not be saved", { description: message });
    } finally {
      setBusy(null);
    }
  }

  async function uploadProductImage(event: ChangeEvent<HTMLInputElement>) {
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
        description: "Save the product to attach the image.",
      });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Unable to upload the image.";
      setError(message);
      toast.error("Image upload failed", { description: message });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function confirmStatusChange() {
    if (!archiveTarget) return;

    const target = archiveTarget;
    const isCategory = target.kind === "category";
    const isActive = target.record.isActive;
    const resource = isCategory ? "categories" : "products";
    const action = isActive ? "archive" : "restore";
    setBusy(isCategory ? "category" : "product");
    setError("");
    try {
      const result = await request(
        "/api/admin/" + resource + "/" + target.record.id + "/" + action,
        "POST",
      );
      if (isCategory) {
        const category = result.category as Category;
        setCategories((current) =>
          current.map((item) => (item.id === category.id ? category : item)),
        );
      } else {
        const product = result.product as Product;
        setProducts((current) =>
          current.map((item) => (item.id === product.id ? product : item)),
        );
      }
      toast.success(
        isActive
          ? (isCategory ? "Category" : "Product") + " archived"
          : (isCategory ? "Category" : "Product") + " restored",
      );
      setArchiveTarget(null);
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "The catalogue status could not be changed.";
      setError(message);
      toast.error(
        (isCategory ? "Category" : "Product") +
          " status could not be changed",
        { description: message },
      );
    } finally {
      setBusy(null);
    }
  }

  function requestCategoryArchive(summary: (typeof categorySummaries)[number]) {
    if (summary.category.isActive && summary.activeCount > 0) {
      setCategoryPreviewId(summary.category.id);
      toast.message("Review active products first", {
        description:
          "Archive or move every active product before archiving this category.",
      });
      return;
    }
    setArchiveTarget({ kind: "category", record: summary.category });
  }

  function clearProductFilters() {
    setProductQuery("");
    setProductStatus("active");
    setProductCategoryId("all");
  }

  return (
    <main className="mx-auto w-full max-w-[112rem] space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#3b2116] px-5 py-6 text-[#fff9ee] shadow-[0_22px_54px_rgba(59,33,22,.22)] sm:px-7 sm:py-8 lg:px-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-white/10 bg-[#f4bd4d]/15" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-[#a56328]/30 blur-3xl" />
        <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.17em] text-[#f8d891]">
              <Layers3 aria-hidden="true" className="size-3.5" />
              Store administration
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">
              Catalogue control
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#f7dfbb] sm:text-base">
              Keep your customer menu accurate. Organize items by category,
              update prices in ETB, and archive records without changing order
              history.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row xl:shrink-0">
            <Button type="button" variant="outline" onClick={() => openCategoryForm()} disabled={busy !== null} className="min-h-11 rounded-2xl border-white/20 bg-white/10 px-4 text-[#fff9ee] hover:bg-white/20 hover:text-white">
              <FolderPlus aria-hidden="true" />
              Add category
            </Button>
            <Button type="button" onClick={() => openProductForm()} disabled={busy !== null || !activeCategories.length} className="min-h-11 rounded-2xl bg-[#f4bd4d] px-4 font-bold text-[#3b2116] hover:bg-[#ffd36f]">
              <Plus aria-hidden="true" />
              Add product
            </Button>
          </div>
        </div>

        <dl className="relative mt-7 grid gap-3 sm:grid-cols-3">
          <SummaryStat label="Active categories" value={activeCategories.length} detail="Available for new products" />
          <SummaryStat label="Visible products" value={publishedProductCount} detail="Shown on the customer menu" />
          <SummaryStat label="Archived records" value={archivedItemCount} detail="Kept for operations and history" />
        </dl>
        {!activeCategories.length && (
          <p className="relative mt-5 flex items-start gap-2 rounded-2xl border border-[#f4bd4d]/40 bg-[#f4bd4d]/10 p-3 text-sm leading-5 text-[#fff0d5]">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#f4bd4d]" />
            Create or restore an active category before adding a product.
          </p>
        )}
      </section>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-900">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <section aria-labelledby="category-management-heading" className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_16px_42px_rgba(88,49,22,.09)] backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a56328]">Menu structure</p>
            <h2 id="category-management-heading" className="mt-1 text-2xl font-extrabold tracking-[-.03em] text-[#2c1911]">Categories</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#725b4c]">
              Open a category to review the active products customers can see.
              Archive it only after its active products are moved or archived.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => openCategoryForm()} disabled={busy !== null} className="min-h-11 shrink-0 rounded-2xl border-[#dfc6a9] bg-white/70 text-[#6f3c1e] hover:bg-[#f5dfba] hover:text-[#482719]">
            <FolderPlus aria-hidden="true" />
            New category
          </Button>
        </div>
        {categorySummaries.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categorySummaries.map((summary) => (
              <CategoryCard
                key={summary.category.id}
                summary={summary}
                busy={busy !== null}
                onOpen={() => setCategoryPreviewId(summary.category.id)}
                onEdit={() => openCategoryForm(summary.category)}
                onStatusChange={() => requestCategoryArchive(summary)}
              />
            ))}
          </div>
        ) : (
          <EmptyState icon={Tags} title="Start with a menu category" description="Categories make the customer menu easier to browse and keep product management orderly." actionLabel="Create first category" onAction={() => openCategoryForm()} />
        )}
      </section>

      <section aria-labelledby="product-management-heading" className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_16px_42px_rgba(88,49,22,.09)] backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a56328]">Customer menu inventory</p>
            <h2 id="product-management-heading" className="mt-1 text-2xl font-extrabold tracking-[-.03em] text-[#2c1911]">Products</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#725b4c]">
              Search every product here. On phones, open a category above to
              inspect the active customer menu in a focused dialog.
            </p>
          </div>
          <Button type="button" onClick={() => openProductForm()} disabled={busy !== null || !activeCategories.length} className="min-h-11 shrink-0 rounded-2xl bg-[#8d471f] px-4 text-white hover:bg-[#713717]">
            <Plus aria-hidden="true" />
            New product
          </Button>
        </div>

        <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-[#ead9bf] bg-[#fffaf0]/80 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] sm:p-4">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#8a654d]" />
            <input value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Search products or categories" className={cn(inputClass, "pl-10")} />
          </label>
          <label className="grid gap-1 text-xs font-bold uppercase tracking-[.12em] text-[#725b4c]">
            Status
            <select value={productStatus} onChange={(event) => setProductStatus(event.target.value as ProductStatus)} className={inputClass}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All records</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-bold uppercase tracking-[.12em] text-[#725b4c]">
            Category
            <select value={productCategoryId} onChange={(event) => setProductCategoryId(event.target.value)} className={inputClass}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}{category.isActive ? "" : " (archived)"}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" variant="ghost" onClick={clearProductFilters} disabled={!hasProductFilters} className="min-h-11 self-end rounded-xl text-[#7d4018] hover:bg-[#f5dfba] hover:text-[#56301b]">
            Clear filters
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[#725b4c]" aria-live="polite">
          <p>{visibleProducts.length === 1 ? "1 product shown" : String(visibleProducts.length) + " products shown"}</p>
          {productStatus === "active" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              Customer-visible view
            </span>
          )}
        </div>
        {visibleProducts.length ? (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} busy={busy !== null} onEdit={() => openProductForm(product)} onStatusChange={() => setArchiveTarget({ kind: "product", record: product })} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageOpen}
            title={products.length ? "No products match these filters" : "No products yet"}
            description={products.length ? "Try another search, status, or category." : "Create a product after you have an active category."}
            actionLabel={products.length ? "Clear filters" : "Add product"}
            onAction={products.length ? clearProductFilters : () => openProductForm()}
            disabled={!products.length && !activeCategories.length}
          />
        )}
      </section>

      <CategoryProductsDialog
        category={previewCategory}
        activeCategories={activeCategories}
        products={previewProducts}
        busy={busy !== null}
        onOpenChange={(open) => {
          if (!open) setCategoryPreviewId(null);
        }}
        onSelectCategory={setCategoryPreviewId}
        onAddProduct={() => {
          const categoryId = previewCategory?.id;
          setCategoryPreviewId(null);
          openProductForm(undefined, categoryId);
        }}
        onEditProduct={(product) => {
          setCategoryPreviewId(null);
          openProductForm(product);
        }}
        onStatusChange={(product) => {
          setCategoryPreviewId(null);
          setArchiveTarget({ kind: "product", record: product });
        }}
      />
      <CatalogueEditorDialog
        mode={formMode}
        categoryForm={categoryForm}
        productForm={productForm}
        categoryErrors={categoryErrors}
        productErrors={productErrors}
        activeCategories={activeCategories}
        editingCategory={Boolean(editingCategoryId)}
        editingProduct={Boolean(editingProductId)}
        busy={busy}
        uploading={uploading}
        error={error}
        onOpenChange={(open) => {
          if (!open) closeFormDialog();
        }}
        onCategoryChange={(name, value) => setCategoryForm((current) => ({ ...current, [name]: value }))}
        onProductChange={(name, value) => setProductForm((current) => ({ ...current, [name]: value }))}
        onCategorySubmit={saveCategory}
        onProductSubmit={saveProduct}
        onUpload={uploadProductImage}
        onCancel={closeFormDialog}
      />
      <StatusDialog
        target={archiveTarget}
        busy={busy}
        onOpenChange={(open) => {
          if (!open && !busy) setArchiveTarget(null);
        }}
        onConfirm={confirmStatusChange}
      />
    </main>
  );
}

function SummaryStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <dt className="text-xs font-bold uppercase tracking-[.13em] text-[#e9ca9e]">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-extrabold tabular-nums text-white">
        {value}
      </dd>
      <p className="mt-1 text-xs leading-5 text-[#f7dfbb]">{detail}</p>
    </div>
  );
}

function CategoryCard({
  summary,
  busy,
  onOpen,
  onEdit,
  onStatusChange,
}: {
  summary: CategorySummary;
  busy: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onStatusChange: () => void;
}) {
  const { category, totalCount, activeCount, archivedCount } = summary;
  return (
    <article
      className={cn(
        "group rounded-[1.5rem] border p-4 transition duration-200 motion-reduce:transition-none",
        category.isActive
          ? "border-[#ead9bf] bg-[#fffaf0]/85 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_32px_rgba(88,49,22,.1)]"
          : "border-[#ded9d3] bg-[#f5f2ee]/75",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-extrabold text-[#2c1911]">
              {category.name}
            </h3>
            <Status active={category.isActive} />
          </div>
          <p className="mt-1 truncate text-sm text-[#725b4c]">
            /{category.slug}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={busy}
              aria-label={"Actions for " + category.name}
              className="size-11 shrink-0 rounded-xl text-[#6f4831] hover:bg-[#f5dfba] hover:text-[#482719]"
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-2xl border-[#ead9bf] bg-[#fffaf0]/95 p-1.5 shadow-[0_16px_40px_rgba(59,33,22,.18)] backdrop-blur-xl"
          >
            <DropdownMenuItem
              onSelect={onEdit}
              className="rounded-xl text-[#51301f] focus:bg-[#f5dfba]"
            >
              <Pencil aria-hidden="true" className="size-4" />
              Edit category
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#ead9bf]" />
            <DropdownMenuItem
              onSelect={onStatusChange}
              variant={category.isActive ? "destructive" : "default"}
              className="rounded-xl"
            >
              {category.isActive ? (
                <Archive aria-hidden="true" className="size-4" />
              ) : (
                <RotateCcw aria-hidden="true" className="size-4" />
              )}
              {category.isActive ? "Archive category" : "Restore category"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-y border-[#ead9bf]/80 py-3 text-center">
        <Count label="Total" value={totalCount} />
        <Count label="Active" value={activeCount} />
        <Count label="Archived" value={archivedCount} />
      </dl>

      <Button
        type="button"
        variant="outline"
        onClick={onOpen}
        disabled={busy || !category.isActive}
        className="mt-4 min-h-11 w-full rounded-xl border-[#dfc6a9] bg-white/70 text-[#6f3c1e] hover:bg-[#f5dfba] hover:text-[#482719]"
      >
        <PackageOpen aria-hidden="true" />
        {category.isActive
          ? "View " +
            activeCount +
            " active " +
            (activeCount === 1 ? "product" : "products")
          : "Archived category"}
      </Button>
    </article>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[.1em] text-[#8a654d]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-extrabold tabular-nums text-[#3b2116]">
        {value}
      </dd>
    </div>
  );
}

function ProductCard({
  product,
  busy,
  onEdit,
  onStatusChange,
}: {
  product: Product;
  busy: boolean;
  onEdit: () => void;
  onStatusChange: () => void;
}) {
  return (
    <article className="flex min-w-0 gap-3 rounded-[1.5rem] border border-[#ead9bf] bg-[#fffaf0]/85 p-3.5 transition duration-200 hover:bg-white hover:shadow-[0_12px_28px_rgba(88,49,22,.08)] motion-reduce:transition-none">
      <ProductMarker hasImage={Boolean(product.imageUrl)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-extrabold text-[#2c1911]">
                {product.name}
              </h3>
              <Status active={product.isActive} />
            </div>
            <p className="mt-1 text-sm font-semibold text-[#7d4018]">
              {product.category.name}
              {!product.category.isActive && " · category archived"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={busy}
                aria-label={"Actions for " + product.name}
                className="size-11 shrink-0 rounded-xl text-[#6f4831] hover:bg-[#f5dfba] hover:text-[#482719]"
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-2xl border-[#ead9bf] bg-[#fffaf0]/95 p-1.5 shadow-[0_16px_40px_rgba(59,33,22,.18)] backdrop-blur-xl"
            >
              <DropdownMenuItem
                onSelect={onEdit}
                className="rounded-xl text-[#51301f] focus:bg-[#f5dfba]"
              >
                <Pencil aria-hidden="true" className="size-4" />
                Edit product
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#ead9bf]" />
              <DropdownMenuItem
                onSelect={onStatusChange}
                variant={product.isActive ? "destructive" : "default"}
                className="rounded-xl"
              >
                {product.isActive ? (
                  <Archive aria-hidden="true" className="size-4" />
                ) : (
                  <RotateCcw aria-hidden="true" className="size-4" />
                )}
                {product.isActive ? "Archive product" : "Restore product"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 text-sm leading-5 text-[#725b4c]">
            {product.description || "No description added yet."}
          </p>
          <p className="shrink-0 text-base font-extrabold tabular-nums text-[#3b2116]">
            ETB {product.price}
          </p>
        </div>
      </div>
    </article>
  );
}

function ProductMarker({ hasImage }: { hasImage: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-2xl border",
        hasImage
          ? "border-[#e6bf83] bg-[#f5dfba] text-[#7d4018]"
          : "border-[#ead9bf] bg-white text-[#9b806d]",
      )}
    >
      {hasImage ? (
        <ImagePlus className="size-5" />
      ) : (
        <PackageOpen className="size-5" />
      )}
    </span>
  );
}

function CategoryProductsDialog({
  category,
  activeCategories,
  products,
  busy,
  onOpenChange,
  onSelectCategory,
  onAddProduct,
  onEditProduct,
  onStatusChange,
}: {
  category: Category | null;
  activeCategories: Category[];
  products: Product[];
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCategory: (id: string) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onStatusChange: (product: Product) => void;
}) {
  return (
    <Dialog open={Boolean(category)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-3xl gap-0 overflow-y-auto p-0 sm:max-h-[calc(100dvh-2rem)]">
        <DialogHeader className="border-b border-[#ead9bf] bg-[#fffaf0] px-5 py-5 pr-14 sm:px-7 sm:py-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a56328]">
            Customer-visible menu
          </p>
          <DialogTitle className="text-2xl sm:text-3xl">
            {category?.name ?? "Category products"}
          </DialogTitle>
          <DialogDescription>
            These are the active products assigned to this active category.
            Archiving a product removes it from the customer menu.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#8a654d]">
              Browse active categories
            </p>
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Active categories">
              {activeCategories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === category?.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={cn(
                    "min-h-11 rounded-full border px-3.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#934817]",
                    item.id === category?.id
                      ? "border-[#8d471f] bg-[#8d471f] text-white"
                      : "border-[#dfc6a9] bg-white text-[#6f3c1e] hover:bg-[#f5dfba]",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-[#2c1911]">Active products</h3>
              <p className="mt-1 text-sm text-[#725b4c]">
                {products.length === 1
                  ? "1 product shown to customers"
                  : String(products.length) + " products shown to customers"}
              </p>
            </div>
            <Button type="button" onClick={onAddProduct} disabled={busy || !category} className="min-h-11 shrink-0 rounded-xl bg-[#8d471f] text-white hover:bg-[#713717]">
              <Plus aria-hidden="true" />
              Add item
            </Button>
          </div>
          {products.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} busy={busy} onEdit={() => onEditProduct(product)} onStatusChange={() => onStatusChange(product)} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#dfc6a9] bg-[#fffaf0] p-6 text-center">
              <PackageOpen aria-hidden="true" className="mx-auto size-7 text-[#9b6a42]" />
              <p className="mt-3 font-extrabold text-[#3b2116]">No active products yet</p>
              <p className="mt-1 text-sm leading-6 text-[#725b4c]">
                Add a product to make this category available on the customer menu.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CatalogueEditorDialog({
  mode,
  categoryForm,
  productForm,
  categoryErrors,
  productErrors,
  activeCategories,
  editingCategory,
  editingProduct,
  busy,
  uploading,
  error,
  onOpenChange,
  onCategoryChange,
  onProductChange,
  onCategorySubmit,
  onProductSubmit,
  onUpload,
  onCancel,
}: {
  mode: FormMode | null;
  categoryForm: CategoryForm;
  productForm: ProductForm;
  categoryErrors: FormErrors<CategoryForm>;
  productErrors: FormErrors<ProductForm>;
  activeCategories: Category[];
  editingCategory: boolean;
  editingProduct: boolean;
  busy: "category" | "product" | null;
  uploading: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onCategoryChange: (name: keyof CategoryForm, value: string) => void;
  onProductChange: <K extends keyof ProductForm>(
    name: K,
    value: ProductForm[K],
  ) => void;
  onCategorySubmit: (event: FormEvent<HTMLFormElement>) => void;
  onProductSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}) {
  const isCategory = mode === "category";
  const isProduct = mode === "product";
  const isBusy = busy !== null;

  return (
    <Dialog open={mode !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-2xl gap-0 overflow-y-auto p-0 sm:max-h-[calc(100dvh-2rem)]">
        <DialogHeader className="border-b border-[#ead9bf] bg-[#fffaf0] px-5 py-5 pr-14 sm:px-7 sm:py-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a56328]">
            {isCategory ? "Menu structure" : "Customer menu item"}
          </p>
          <DialogTitle className="text-2xl sm:text-3xl">
            {isCategory
              ? editingCategory
                ? "Edit category"
                : "Create category"
              : editingProduct
                ? "Edit product"
                : "Create product"}
          </DialogTitle>
          <DialogDescription>
            {isCategory
              ? "Use a clear name and URL-safe slug so this category stays easy to manage."
              : "Only products in an active category can be saved. Prices are managed in Ethiopian birr (ETB)."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="mx-5 mt-5 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium leading-6 text-red-900 sm:mx-7">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        {isCategory && (
          <form onSubmit={onCategorySubmit} className="grid gap-5 px-5 py-5 sm:px-7 sm:py-6">
            <FormField label="Category name" htmlFor="catalogue-category-name" error={categoryErrors.name}>
              <input
                id="catalogue-category-name"
                autoFocus
                autoComplete="off"
                aria-invalid={Boolean(categoryErrors.name)}
                aria-describedby={categoryErrors.name ? "catalogue-category-name-error" : undefined}
                value={categoryForm.name}
                onChange={(event) => onCategoryChange("name", event.target.value)}
                placeholder="Coffee and espresso"
                className={inputClass}
              />
            </FormField>
            <FormField label="URL slug" htmlFor="catalogue-category-slug" error={categoryErrors.slug} help="Lowercase letters, numbers, and single hyphens only.">
              <input
                id="catalogue-category-slug"
                autoComplete="off"
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                aria-invalid={Boolean(categoryErrors.slug)}
                aria-describedby={categoryErrors.slug ? "catalogue-category-slug-error" : "catalogue-category-slug-help"}
                value={categoryForm.slug}
                onChange={(event) => onCategoryChange("slug", event.target.value.toLowerCase())}
                placeholder="coffee-and-espresso"
                className={inputClass}
              />
            </FormField>
            <DialogFooter className="border-t border-[#ead9bf] pt-5">
              <Button type="button" variant="outline" disabled={isBusy} onClick={onCancel} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white text-[#6f3c1e] hover:bg-[#f5dfba]">
                Cancel
              </Button>
              <Button disabled={isBusy} className="min-h-11 rounded-xl bg-[#8d471f] text-white hover:bg-[#713717]">
                {editingCategory ? <Save aria-hidden="true" /> : <FolderPlus aria-hidden="true" />}
                {busy === "category"
                  ? "Saving…"
                  : editingCategory
                    ? "Save category"
                    : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {isProduct && (
          <form onSubmit={onProductSubmit} className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-7 sm:py-6">
            <FormField label="Product name" htmlFor="catalogue-product-name" error={productErrors.name}>
              <input
                id="catalogue-product-name"
                autoFocus
                autoComplete="off"
                aria-invalid={Boolean(productErrors.name)}
                aria-describedby={productErrors.name ? "catalogue-product-name-error" : undefined}
                value={productForm.name}
                onChange={(event) => onProductChange("name", event.target.value)}
                placeholder="Double espresso"
                className={inputClass}
              />
            </FormField>
            <FormField label="Category" htmlFor="catalogue-product-category" error={productErrors.categoryId}>
              <select
                id="catalogue-product-category"
                aria-invalid={Boolean(productErrors.categoryId)}
                aria-describedby={productErrors.categoryId ? "catalogue-product-category-error" : undefined}
                value={productForm.categoryId}
                onChange={(event) => onProductChange("categoryId", event.target.value)}
                className={inputClass}
              >
                <option value="">Choose an active category</option>
                {activeCategories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Price (ETB)" htmlFor="catalogue-product-price" error={productErrors.price} help="Up to two decimal places.">
              <input
                id="catalogue-product-price"
                inputMode="decimal"
                aria-invalid={Boolean(productErrors.price)}
                aria-describedby={productErrors.price ? "catalogue-product-price-error" : "catalogue-product-price-help"}
                value={productForm.price}
                onChange={(event) => onProductChange("price", event.target.value)}
                placeholder="85.00"
                className={inputClass}
              />
            </FormField>
            <FormField label="Image URL (optional)" htmlFor="catalogue-product-image-url" error={productErrors.imageUrl}>
              <input
                id="catalogue-product-image-url"
                type="url"
                inputMode="url"
                placeholder="https://…"
                aria-invalid={Boolean(productErrors.imageUrl)}
                aria-describedby={productErrors.imageUrl ? "catalogue-product-image-url-error" : undefined}
                value={productForm.imageUrl}
                onChange={(event) => onProductChange("imageUrl", event.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField
              label="Upload image (optional)"
              htmlFor="catalogue-product-image-upload"
              help={
                uploading
                  ? "Uploading image…"
                  : productForm.imageUrl
                    ? "Image attached. Save the product to apply it."
                    : "JPEG, PNG, WebP, or AVIF · 5 MB maximum."
              }
            >
              <input
                id="catalogue-product-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onUpload}
                disabled={uploading || isBusy}
                className={cn(inputClass, "cursor-pointer py-2 file:mr-3 file:rounded-lg file:bg-[#f5dfba] file:px-2 file:py-1 file:text-[#6f3c1e]")}
              />
            </FormField>
            <div className="flex min-h-11 items-center rounded-2xl border border-[#ead9bf] bg-[#fffaf0] px-3.5 sm:mt-6">
              <label htmlFor="catalogue-product-active" className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#3b2116]">
                <input
                  id="catalogue-product-active"
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(event) => onProductChange("isActive", event.target.checked)}
                  className="size-4 rounded border-[#b78963] accent-[#8d471f]"
                />
                Active on customer menu
              </label>
            </div>
            <FormField label="Description" htmlFor="catalogue-product-description" error={productErrors.description} help="Optional. Keep it short and helpful for customers." className="sm:col-span-2">
              <textarea
                id="catalogue-product-description"
                aria-invalid={Boolean(productErrors.description)}
                aria-describedby={productErrors.description ? "catalogue-product-description-error" : "catalogue-product-description-help"}
                value={productForm.description}
                onChange={(event) => onProductChange("description", event.target.value)}
                maxLength={1000}
                rows={4}
                className={cn(inputClass, "min-h-28 resize-y py-3")}
              />
            </FormField>
            <DialogFooter className="border-t border-[#ead9bf] pt-5 sm:col-span-2">
              <Button type="button" variant="outline" disabled={isBusy || uploading} onClick={onCancel} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white text-[#6f3c1e] hover:bg-[#f5dfba]">
                Cancel
              </Button>
              <Button disabled={isBusy || uploading || !activeCategories.length} className="min-h-11 rounded-xl bg-[#8d471f] text-white hover:bg-[#713717]">
                {editingProduct ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
                {busy === "product"
                  ? "Saving…"
                  : editingProduct
                    ? "Save product"
                    : "Create product"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({
  target,
  busy,
  onOpenChange,
  onConfirm,
}: {
  target: ArchiveTarget | null;
  busy: "category" | "product" | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isCategory = target?.kind === "category";
  const isActive = target?.record.isActive ?? false;
  const action = isActive ? "Archive" : "Restore";
  const noun = isCategory ? "category" : "product";
  const isBusy = busy !== null;

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a56328]">
            Confirm catalogue change
          </p>
          <DialogTitle>
            {action} {target?.record.name}?
          </DialogTitle>
          <DialogDescription>
            {isActive
              ? isCategory
                ? "This category can only be archived after all of its active products are moved or archived. Historical orders will remain unchanged."
                : "This product will no longer appear or be orderable from the customer menu. Historical orders will remain unchanged."
              : "This " +
                noun +
                " will become available in administration again" +
                (isCategory
                  ? "; active products can then be assigned to it."
                  : ".")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isBusy} onClick={() => onOpenChange(false)} className="min-h-11 rounded-xl border-[#dfc6a9] bg-white text-[#6f3c1e] hover:bg-[#f5dfba]">
            Cancel
          </Button>
          <Button
            type="button"
            variant={isActive ? "destructive" : "default"}
            disabled={isBusy}
            onClick={onConfirm}
            className={cn(
              "min-h-11 rounded-xl",
              isActive
                ? "bg-red-700 hover:bg-red-800"
                : "bg-[#8d471f] text-white hover:bg-[#713717]",
            )}
          >
            {isActive ? <Archive aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
            {isBusy ? action + "ing…" : action + " " + noun}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormField({
  label,
  htmlFor,
  children,
  className = "",
  error,
  help,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
  error?: string;
  help?: string;
}) {
  const errorId = htmlFor + "-error";
  const helpId = htmlFor + "-help";
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-bold text-[#3b2116]">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : help ? (
        <p id={helpId} className="text-xs leading-5 text-[#725b4c]">
          {help}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  disabled = false,
}: {
  icon: typeof PackageOpen;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#dfc6a9] bg-[#fffaf0]/75 px-5 py-9 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f5dfba] text-[#7d4018]">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className="mt-4 font-extrabold text-[#3b2116]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#725b4c]">
        {description}
      </p>
      <Button type="button" variant="outline" onClick={onAction} disabled={disabled} className="mt-5 min-h-11 rounded-xl border-[#dfc6a9] bg-white text-[#6f3c1e] hover:bg-[#f5dfba]">
        {actionLabel}
      </Button>
    </div>
  );
}

function Status({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.08em]",
        active
          ? "bg-emerald-100 text-emerald-900"
          : "bg-slate-200 text-slate-700",
      )}
    >
      {active ? "Active" : "Archived"}
    </span>
  );
}
