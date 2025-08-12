import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productAPI = {
  getAll: async () => {
    const { data } = await api.get('/products');
    return data;
  },
  
  create: async (product) => {
    const { data } = await api.post('/products', product);
    return data;
  },
};

export const auctionAPI = {
  getAll: async () => {
    const { data } = await api.get('/auctions');
    return data;
  },
  
  getLive: async () => {
    const { data } = await api.get('/auctions/live');
    return data;
  },
  
  create: async (auction) => {
    const { data } = await api.post('/auctions', auction);
    return data;
  },
  
  start: async (auctionId) => {
    const { data } = await api.post(`/auctions/${auctionId}/start`);
    return data;
  },
  
  placeBid: async (auctionId, bidderId, amount) => {
    const { data } = await api.post(`/auctions/${auctionId}/bid`, {
      bidderId,
      amount,
    });
    return data;
  },
  
  end: async (auctionId) => {
    const { data } = await api.post(`/auctions/${auctionId}/end`);
    return data;
  },
};

export const deliveryAPI = {
  getAll: async () => {
    const { data } = await api.get('/deliveries');
    return data;
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/deliveries/${id}`);
    return data;
  },
};

export const userAPI = {
  getAll: async () => {
    const { data } = await api.get('/users');
    return data;
  },
};