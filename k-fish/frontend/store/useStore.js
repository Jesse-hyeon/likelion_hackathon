import { create } from 'zustand';

export const useStore = create((set) => ({
  currentUser: null,
  currentMode: 'fisherman',
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