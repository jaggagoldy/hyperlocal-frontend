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

        // Automatically clear cart if switching to a new vendor or order type
        if ((vendorId && vendorId !== item.businessProfileId) || (orderType && orderType !== currentOrderType && cartItems.length > 0)) {
          cartItems = [];
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
            vendorId: item.businessProfileId,
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
