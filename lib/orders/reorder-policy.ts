type ReorderSourceItem = {
  quantity: number;
  product: {
    id: string;
    name: string;
    price: { toString(): string };
    imageUrl: string | null;
    isActive: boolean;
    category: { isActive: boolean };
  };
};

export type CustomerReorderPreview = {
  available: {
    productId: string;
    name: string;
    price: string;
    imageUrl: string | null;
    quantity: number;
  }[];
  unavailable: { productId: string; name: string; quantity: number; reason: string }[];
};

export function buildCustomerReorderPreview(items: ReorderSourceItem[]): CustomerReorderPreview {
  return items.reduce<CustomerReorderPreview>((preview, item) => {
    const { product } = item;
    if (!product.isActive || !product.category.isActive) {
      preview.unavailable.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        reason: !product.isActive ? "This item is no longer available." : "This item’s category is no longer available.",
      });
      return preview;
    }

    preview.available.push({
      productId: product.id,
      name: product.name,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      quantity: item.quantity,
    });
    return preview;
  }, { available: [], unavailable: [] });
}
