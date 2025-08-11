import { create } from 'zustand';
import { User, Product, Auction, Delivery, UserType } from '@/types';

interface AppState {
  currentUser: User | null;
  currentMode: UserType;
  products: Product[];
  auctions: Auction[];
  deliveries: Delivery[];
  setCurrentUser: (user: User | null) => void;
  setCurrentMode: (mode: UserType) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  setAuctions: (auctions: Auction[]) => void;
  updateAuction: (auction: Auction) => void;
  setDeliveries: (deliveries: Delivery[]) => void;
  updateDelivery: (delivery: Delivery) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  currentMode: 'fisherman' as UserType,
  products: [],
  auctions: [],
  deliveries: [],
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setCurrentMode: (mode) => set({ currentMode: mode }),
  
  setProducts: (products) => set({ products }),
  
  addProduct: (product) => set((state) => ({
    products: [...state.products, product]
  })),
  
  updateProduct: (product) => set((state) => ({
    products: state.products.map(p => 
      p.id === product.id ? product : p
    )
  })),
  
  setAuctions: (auctions) => set({ auctions }),
  
  updateAuction: (auction) => set((state) => ({
    auctions: state.auctions.map(a => 
      a.id === auction.id ? auction : a
    )
  })),
  
  setDeliveries: (deliveries) => set({ deliveries }),
  
  updateDelivery: (delivery) => set((state) => ({
    deliveries: state.deliveries.map(d => 
      d.id === delivery.id ? delivery : d
    )
  }))
}));