import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mode: 'demo'
  });
});

// Demo data storage (in-memory for demo)
const demoData = {
  users: new Map(),
  vendors: new Map(),
  transactions: [],
  menus: new Map()
};

// Contract addresses on Base Sepolia
const CONTRACTS = {
  bUSDC: '0xeb9361Ec0d712C5B12965FB91c409262b7d6703c',
  PaymentRouter: '0xd4C84453E1640BDD8a9EB0Dd645c0C4208dD66eF',
  VendorRegistry: '0xA9F04F020CF9F511982719196E25FE7c666c9E4D',
  SubnameRegistrar: '0xC3b022250C359c9A9793d018503c20495FcD1B4F',
  Paymaster: '0x23E3d0017A282f48bF80dE2A6E670f57be2C9152'
};

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, phone, name } = req.body;
  const userId = `user_${Date.now()}`;
  
  demoData.users.set(userId, {
    id: userId,
    email,
    phone,
    name,
    createdAt: new Date().toISOString(),
    isVendor: false
  });
  
  res.json({
    success: true,
    data: {
      user: demoData.users.get(userId),
      token: `demo_token_${userId}`
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  
  // Find user by email
  let user = null;
  for (const [id, userData] of demoData.users) {
    if (userData.email === email) {
      user = userData;
      break;
    }
  }
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      user,
      token: `demo_token_${user.id}`
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !token.startsWith('demo_token_')) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  const userId = token.replace('demo_token_', '');
  const user = demoData.users.get(userId);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

// Vendor routes
app.post('/api/vendor/register', (req, res) => {
  const { businessName, businessType, phone, address } = req.body;
  const vendorId = `vendor_${Date.now()}`;
  
  const vendor = {
    id: vendorId,
    businessName,
    businessType,
    phone,
    address,
    status: 'pending',
    createdAt: new Date().toISOString(),
    isVerified: false
  };
  
  demoData.vendors.set(vendorId, vendor);
  
  res.json({
    success: true,
    data: vendor
  });
});

app.get('/api/vendor/status/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Find vendor by user ID
  let vendor = null;
  for (const [id, vendorData] of demoData.vendors) {
    if (vendorData.userId === userId) {
      vendor = vendorData;
      break;
    }
  }
  
  res.json({
    success: true,
    data: vendor || null
  });
});

// Menu routes
app.post('/api/menu', (req, res) => {
  const { vendorId, items } = req.body;
  
  const menu = {
    vendorId,
    items,
    createdAt: new Date().toISOString()
  };
  
  demoData.menus.set(vendorId, menu);
  
  res.json({
    success: true,
    data: menu
  });
});

app.get('/api/menu/:vendorId', (req, res) => {
  const { vendorId } = req.params;
  const menu = demoData.menus.get(vendorId);
  
  res.json({
    success: true,
    data: menu || { items: [] }
  });
});

// Transaction routes
app.post('/api/transactions', (req, res) => {
  const { from, to, amount, type, description } = req.body;
  
  const transaction = {
    id: `tx_${Date.now()}`,
    from,
    to,
    amount,
    type,
    description,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  
  demoData.transactions.push(transaction);
  
  res.json({
    success: true,
    data: transaction
  });
});

app.get('/api/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  
  const userTransactions = demoData.transactions.filter(
    tx => tx.from === userId || tx.to === userId
  );
  
  res.json({
    success: true,
    data: userTransactions
  });
});

// Faucet route
app.post('/api/faucet/request', (req, res) => {
  const { address } = req.body;
  
  res.json({
    success: true,
    data: {
      message: 'Demo faucet - funds would be sent to your wallet',
      address,
      amount: '1000',
      currency: 'bUSDC'
    }
  });
});

// Profile routes
app.put('/api/profile', (req, res) => {
  const { userId, ...updates } = req.body;
  
  const user = demoData.users.get(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  const updatedUser = { ...user, ...updates };
  demoData.users.set(userId, updatedUser);
  
  res.json({
    success: true,
    data: updatedUser
  });
});

// Contract info endpoint
app.get('/api/contracts', (req, res) => {
  res.json({
    success: true,
    data: CONTRACTS
  });
});

// Balance endpoint (simulated)
app.get('/api/balance/:address', (req, res) => {
  const { address } = req.params;
  
  // Simulate balance check
  const balance = Math.random() * 1000; // Random balance for demo
  
  res.json({
    success: true,
    data: {
      address,
      balance: balance.toFixed(6),
      currency: 'bUSDC',
      decimals: 6
    }
  });
});

// ENS resolution endpoint
app.post('/api/ens/resolve', (req, res) => {
  const { name } = req.body;
  
  // Simulate ENS resolution
  const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
  
  res.json({
    success: true,
    data: {
      name,
      address: mockAddress,
      resolved: true
    }
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Demo Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Mode: Demo (in-memory storage)`);
});

export default app;
