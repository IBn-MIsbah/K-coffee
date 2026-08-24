import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ITEM_QUANTITY = 99;

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface CartProduct {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  replaceItems: (items: CartItem[]) => void;
  setQuantity: (productId: string, quantity: number) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(MAX_ITEM_QUANTITY, Math.max(0, Math.floor(quantity)));
}

function isValidProduct(product: CartProduct) {
  return (
    Boolean(product.productId) &&
    Boolean(product.name.trim()) &&
    Number.isFinite(product.price) &&
    product.price >= 0
  );
}

function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<CartItem>;
    const product: CartProduct = {
      productId: candidate.productId ?? "",
      name: candidate.name ?? "",
      price: candidate.price ?? Number.NaN,
      imageUrl: candidate.imageUrl,
    };
    const quantity = normalizeQuantity(candidate.quantity ?? 0);
    return isValidProduct(product) && quantity > 0 ? [{ ...product, quantity }] : [];
  });
}

export const getCartItemCount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const getCartSubtotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, requestedQuantity = 1) => {
        if (!isValidProduct(product)) return;
        const quantity = normalizeQuantity(requestedQuantity);
        if (quantity === 0) return;

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.productId
          );

          if (!existingItem) {
            return {
              items: [
                ...state.items,
                { ...product, quantity },
              ],
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === product.productId
                ? {
                    ...item,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: normalizeQuantity(item.quantity + quantity),
                  }
                : item
            ),
          };
        });
      },
      replaceItems: (items) => set({ items: sanitizeCartItems(items) }),
      setQuantity: (productId, requestedQuantity) => {
        const quantity = normalizeQuantity(requestedQuantity);
        set((state) => ({
          items:
            quantity === 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item
                ),
        }));
      },
      incrementItem: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: normalizeQuantity(item.quantity + 1) }
              : item
          ),
        })),
      decrementItem: (productId) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.productId !== productId) return [item];
            const quantity = normalizeQuantity(item.quantity - 1);
            return quantity === 0 ? [] : [{ ...item, quantity }];
          }),
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      version: 1,
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartStore>;
        return {
          ...currentState,
          items: sanitizeCartItems(persisted.items),
        };
      },
    }
  )
);
