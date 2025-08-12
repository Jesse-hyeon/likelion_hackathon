// 공통 초기 데이터 관리
export const initialProducts = [
  {
    id: 'live_product1',
    species: '포항 대게',
    quantity: 40,
    weight: 20,
    startPrice: 180000,
    fishermanId: 'fisherman1',
    catchDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    catchLocation: { lat: 35.1796, lng: 129.0756 },
    photos: ['/api/placeholder/300/200']
  },
  {
    id: 'live_product2',
    species: '동해 오징어',
    quantity: 100,
    weight: 35,
    startPrice: 90000,
    fishermanId: 'fisherman2',
    catchDateTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    catchLocation: { lat: 35.1796, lng: 129.0756 },
    photos: ['/api/placeholder/300/200']
  },
  {
    id: 'live_product3',
    species: '과메기용 꽁치',
    quantity: 250,
    weight: 45,
    startPrice: 110000,
    fishermanId: 'fisherman3',
    catchDateTime: new Date().toISOString(),
    catchLocation: { lat: 35.1796, lng: 129.0756 },
    photos: ['/api/placeholder/300/200']
  },
  {
    id: 'live_product4',
    species: '영덕 대게',
    quantity: 35,
    weight: 28,
    startPrice: 220000,
    fishermanId: 'fisherman4',
    catchDateTime: new Date().toISOString(),
    catchLocation: { lat: 35.1796, lng: 129.0756 },
    photos: ['/api/placeholder/300/200']
  },
  {
    id: 'live_product5',
    species: '포항 가자미',
    quantity: 150,
    weight: 25,
    startPrice: 70000,
    fishermanId: 'fisherman5',
    catchDateTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    catchLocation: { lat: 35.1796, lng: 129.0756 },
    photos: ['/api/placeholder/300/200']
  }
];

export const initialAuctions = [
  {
    id: 'live_auction1',
    productId: 'live_product1',
    status: 'live',
    startPrice: 180000,
    currentPrice: 195000,
    location: '포항',
    startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    bids: [
      { bidderId: 'buyer1', amount: 185000, timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
      { bidderId: 'buyer2', amount: 190000, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
      { bidderId: 'buyer3', amount: 195000, timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() }
    ],
    highestBidder: 'buyer3'
  },
  {
    id: 'live_auction2',
    productId: 'live_product2',
    status: 'live',
    startPrice: 90000,
    currentPrice: 98000,
    location: '포항',
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    bids: [
      { bidderId: 'buyer4', amount: 92000, timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
      { bidderId: 'buyer1', amount: 95000, timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
      { bidderId: 'buyer2', amount: 98000, timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() }
    ],
    highestBidder: 'buyer2'
  },
  {
    id: 'live_auction3',
    productId: 'live_product3',
    status: 'live',
    startPrice: 110000,
    currentPrice: 115000,
    location: '포항',
    startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    bids: [
      { bidderId: 'buyer5', amount: 115000, timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() }
    ],
    highestBidder: 'buyer5'
  },
  {
    id: 'live_auction4',
    productId: 'live_product4',
    status: 'pending',
    startPrice: 220000,
    currentPrice: 220000,
    location: '포항',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    bids: [],
    highestBidder: null
  },
  {
    id: 'live_auction5',
    productId: 'live_product5',
    status: 'pending',
    startPrice: 70000,
    currentPrice: 70000,
    location: '포항',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    bids: [],
    highestBidder: null
  }
];