import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CatalogItem } from '@/types/models';

interface CartItem {
  catalogItem: CatalogItem;
  quantity: number;
}

interface CartStore {
  cartItems: CartItem[];
  vendorId: string | null;
  orderType: 'TRANSACTIONAL' | 'BOOKING' | null;
  
  // Actions
  addItem: (item: CatalogItem, orderType: 'TRANSACTIONAL' | 'BOOKING') => { success: boolean, error?: string };
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  getTotalValue: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      vendorId: null,
      orderType: null,

      addItem: (item, currentOrderType) => {
        let { cartItems, vendorId, orderType } = get();

        // If trying to add an item from a different vendor, reject immediately.
        if (vendorId && vendorId !== item.vendorId) {
          return { success: false, error: 'You have items from another vendor in your cart. Please clear your cart first.' };
        }

        // If trying to mix booking/transactional order types, reject.
        if (orderType && orderType !== currentOrderType && cartItems.length > 0) {
          return { success: false, error: 'You cannot mix different service types in one checkout. Please clear your cart first.' };
        }

        const existingItem = cartItems.find(ci => ci.catalogItem.id === item.id);
        
        if (existingItem) {
          set({
            cartItems: cartItems.map(ci => 
              ci.catalogItem.id === item.id 
                ? { ...ci, quantity: ci.quantity + 1 } 
                : ci
            )
          });
        } else {
          set({
            vendorId: item.vendorId,
            orderType: currentOrderType,
            cartItems: [...cartItems, { catalogItem: item, quantity: 1 }]
          });
        }
        
        return { success: true };
      },

      removeItem: (itemId) => {
        set((state) => {
          const newItems = state.cartItems.filter(ci => ci.catalogItem.id !== itemId);
          if (newItems.length === 0) {
            // Reset vendor lock when cart is empty
            return { cartItems: [], vendorId: null, orderType: null };
          }
          return { cartItems: newItems };
        });
      },

      updateQuantity: (itemId, delta) => {
        set((state) => {
          const newItems = state.cartItems.map(ci => {
            if (ci.catalogItem.id === itemId) {
              const newQuantity = Math.max(0, ci.quantity + delta);
              return { ...ci, quantity: newQuantity };
            }
            return ci;
          }).filter(ci => ci.quantity > 0);

          if (newItems.length === 0) {
            return { cartItems: [], vendorId: null, orderType: null };
          }

          return { cartItems: newItems };
        });
      },

      clearCart: () => {
        set({ cartItems: [], vendorId: null, orderType: null });
      },

      getTotalValue: () => {
        const { cartItems } = get();
        return cartItems.reduce((total, ci) => {
          const price = ci.catalogItem.price ? parseFloat(ci.catalogItem.price.toString()) : 0;
          return total + (price * ci.quantity);
        }, 0);
      }
    }),
    {
      name: 'nearbybazar-enquiries', // RE-USING OLD KEY TO MIGRATE/OVERRIDE PROPERLY
    }
  )
);
