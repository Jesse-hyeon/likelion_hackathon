import axios from 'axios';
import { Product, Auction, Bid, Delivery, User } from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data;
  },
  
  create: async (product: Partial<Product>): Promise<Product> => {
    const { data } = await api.post('/products', product);
    return data;
  },
};

export const auctionAPI = {
  getAll: async (): Promise<Auction[]> => {
    const { data } = await api.get('/auctions');
    return data;
  },
  
  getLive: async (): Promise<Auction[]> => {
    const { data } = await api.get('/auctions/live');
    return data;
  },
  
  create: async (auction: Partial<Auction>): Promise<Auction> => {
    const { data } = await api.post('/auctions', auction);
    return data;
  },
  
  start: async (auctionId: string): Promise<Auction> => {
    const { data } = await api.post(`/auctions/${auctionId}/start`);
    return data;
  },
  
  placeBid: async (auctionId: string, bidderId: string, amount: number): Promise<Bid> => {
    const { data } = await api.post(`/auctions/${auctionId}/bid`, {
      bidderId,
      amount,
    });
    return data;
  },
  
  end: async (auctionId: string): Promise<Auction> => {
    const { data } = await api.post(`/auctions/${auctionId}/end`);
    return data;
  },
};

export const deliveryAPI = {
  getAll: async (): Promise<Delivery[]> => {
    const { data } = await api.get('/deliveries');
    return data;
  },
  
  getById: async (id: string): Promise<Delivery> => {
    const { data } = await api.get(`/deliveries/${id}`);
    return data;
  },
};

export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },
};