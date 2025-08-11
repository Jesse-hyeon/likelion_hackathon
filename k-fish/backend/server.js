const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

let products = [];
let auctions = [];
let bids = [];
let deliveries = [];
let users = [
  { id: '1', email: 'fisherman1@kfish.com', name: '김어민', userType: 'fisherman', companyName: '부산수산' },
  { id: '2', email: 'buyer1@kfish.com', name: '이구매', userType: 'buyer', companyName: '서울횟집' },
  { id: '3', email: 'logistics1@kfish.com', name: '박물류', userType: 'logistics', companyName: 'K-물류' },
  { id: '4', email: 'admin@kfish.com', name: '관리자', userType: 'admin', companyName: 'K-Fish' }
];

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/upload', upload.array('images', 6), (req, res) => {
  try {
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ urls: imageUrls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: uuidv4(),
    rfidTag: `RFID-${Date.now()}`,
    boxNumber: `BOX-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    status: 'registered',
    qualityAssessment: req.body.qualityAssessment || null,
    qualityStatus: req.body.qualityAssessment ? 'pending_verification' : 'not_assessed',
    ...req.body
  };
  products.push(newProduct);
  
  io.emit('product_registered', newProduct);
  
  res.json(newProduct);
});

app.post('/api/products/:id/verify-quality', (req, res) => {
  const { status, verifiedBy, comments } = req.body;
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  product.qualityStatus = status;
  product.qualityVerification = {
    verifiedBy,
    verifiedAt: new Date().toISOString(),
    comments,
    status
  };
  
  io.emit('quality_verified', product);
  res.json(product);
});

app.get('/api/auctions', (req, res) => {
  res.json(auctions);
});

app.get('/api/auctions/live', (req, res) => {
  const liveAuctions = auctions.filter(a => a.status === 'live');
  res.json(liveAuctions);
});

app.post('/api/auctions', (req, res) => {
  const newAuction = {
    id: uuidv4(),
    status: 'pending',
    currentPrice: req.body.startPrice,
    highestBidder: null,
    startTime: new Date().toISOString(),
    endTime: null,
    location: req.body.location || '부산',
    ...req.body
  };
  auctions.push(newAuction);
  res.json(newAuction);
});

app.post('/api/auctions/:id/start', (req, res) => {
  const auction = auctions.find(a => a.id === req.params.id);
  if (auction) {
    auction.status = 'live';
    auction.startTime = new Date().toISOString();
    io.emit('auction_started', auction);
    res.json(auction);
  } else {
    res.status(404).json({ error: 'Auction not found' });
  }
});

app.post('/api/auctions/:id/bid', (req, res) => {
  const { bidderId, amount } = req.body;
  const auction = auctions.find(a => a.id === req.params.id);
  
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found' });
  }
  
  if (auction.status !== 'live') {
    return res.status(400).json({ error: 'Auction is not live' });
  }
  
  if (amount <= auction.currentPrice) {
    return res.status(400).json({ error: 'Bid must be higher than current price' });
  }
  
  const newBid = {
    id: uuidv4(),
    auctionId: req.params.id,
    bidderId,
    amount,
    timestamp: new Date().toISOString()
  };
  
  bids.push(newBid);
  auction.currentPrice = amount;
  auction.highestBidder = bidderId;
  
  io.emit('bid_placed', {
    auction,
    bid: newBid
  });
  
  res.json(newBid);
});

app.post('/api/auctions/:id/end', (req, res) => {
  const auction = auctions.find(a => a.id === req.params.id);
  if (auction) {
    auction.status = 'ended';
    auction.endTime = new Date().toISOString();
    
    if (auction.highestBidder) {
      const delivery = {
        id: uuidv4(),
        productId: auction.productId,
        auctionId: auction.id,
        status: 'preparing',
        currentLocation: { lat: 35.1796, lng: 129.0756 },
        temperature: -1,
        estimatedArrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: 'preparing', timestamp: new Date().toISOString() }
        ]
      };
      deliveries.push(delivery);
      
      setTimeout(() => startDeliverySimulation(delivery.id), 5000);
    }
    
    io.emit('auction_ended', auction);
    res.json(auction);
  } else {
    res.status(404).json({ error: 'Auction not found' });
  }
});

app.get('/api/deliveries', (req, res) => {
  res.json(deliveries);
});

app.get('/api/deliveries/:id', (req, res) => {
  const delivery = deliveries.find(d => d.id === req.params.id);
  if (delivery) {
    res.json(delivery);
  } else {
    res.status(404).json({ error: 'Delivery not found' });
  }
});

function startDeliverySimulation(deliveryId) {
  const delivery = deliveries.find(d => d.id === deliveryId);
  if (!delivery) return;
  
  const statuses = ['in_transit', 'delivering', 'delivered'];
  let currentStatus = 0;
  
  const interval = setInterval(() => {
    if (currentStatus >= statuses.length) {
      clearInterval(interval);
      return;
    }
    
    delivery.status = statuses[currentStatus];
    delivery.currentLocation.lat += (Math.random() - 0.5) * 0.1;
    delivery.currentLocation.lng += (Math.random() - 0.5) * 0.1;
    delivery.temperature = -2 + Math.random() * 2;
    delivery.timeline.push({
      status: statuses[currentStatus],
      timestamp: new Date().toISOString()
    });
    
    io.emit('delivery_update', delivery);
    currentStatus++;
  }, 10000);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_auction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`User ${socket.id} joined auction ${auctionId}`);
  });
  
  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`User ${socket.id} left auction ${auctionId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

function generateMockData() {
  const species = ['고등어', '갈치', '오징어', '광어', '우럭', '참치', '연어', '새우', '전복', '해삼'];
  const locations = ['부산', '인천', '목포'];
  
  for (let i = 0; i < 10; i++) {
    const product = {
      id: uuidv4(),
      rfidTag: `RFID-${1000 + i}`,
      boxNumber: `BOX-${1000 + i}`,
      species: species[Math.floor(Math.random() * species.length)],
      weight: Math.floor(Math.random() * 50) + 10,
      quantity: Math.floor(Math.random() * 100) + 10,
      catchDateTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      catchLocation: { lat: 35.1796 + Math.random(), lng: 129.0756 + Math.random() },
      fishermanId: '1',
      photos: [`/api/placeholder/400/300`],
      createdAt: new Date().toISOString(),
      status: 'registered'
    };
    products.push(product);
    
    const auction = {
      id: uuidv4(),
      productId: product.id,
      startPrice: Math.floor(Math.random() * 50000) + 10000,
      currentPrice: Math.floor(Math.random() * 50000) + 10000,
      status: i < 3 ? 'live' : 'ended',
      location: locations[Math.floor(Math.random() * locations.length)],
      startTime: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
      endTime: i < 3 ? null : new Date().toISOString(),
      highestBidder: i < 3 ? null : '2'
    };
    auctions.push(auction);
  }
}

generateMockData();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});