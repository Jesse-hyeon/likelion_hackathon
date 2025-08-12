import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAuction(auctionId) {
    if (this.socket) {
      this.socket.emit('join_auction', auctionId);
    }
  }

  leaveAuction(auctionId) {
    if (this.socket) {
      this.socket.emit('leave_auction', auctionId);
    }
  }

  onProductRegistered(callback) {
    if (this.socket) {
      this.socket.on('product_registered', callback);
    }
  }

  onAuctionStarted(callback) {
    if (this.socket) {
      this.socket.on('auction_started', callback);
    }
  }

  onBidPlaced(callback) {
    if (this.socket) {
      this.socket.on('bid_placed', callback);
    }
  }

  onAuctionEnded(callback) {
    if (this.socket) {
      this.socket.on('auction_ended', callback);
    }
  }

  onDeliveryUpdate(callback) {
    if (this.socket) {
      this.socket.on('delivery_update', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();