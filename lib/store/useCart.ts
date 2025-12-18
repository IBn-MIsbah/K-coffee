// lib/store/useCart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => ({ items: [...state.items, newItem] })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "cart-storage" } // saves to localStorage
  )
);
