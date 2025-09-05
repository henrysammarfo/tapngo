# Tap&Go Pay Backend API

A comprehensive Node.js + Express + PostgreSQL backend for the Tap&Go Pay payment system, supporting gasless transactions, vendor management, and blockchain integrations.

## Features

### 🔐 Authentication & User Management
- Multi-provider signup (wallet, email, phone, social)
- Phone OTP verification via Twilio
- JWT-based authentication
- User profile management

### 🏪 Vendor Management
- Vendor registration with ENS names
- EFP (Ethereum Follow Protocol) verification
- EFPas reputation score integration
- Vendor profile and statistics

### 💰 Payment Processing
- Transaction creation and tracking
- GHS to USDC conversion with real-time FX rates
- Platform fee calculation
- Payment status management

### 🚰 Faucet System
- bUSDC token faucet for testing
- Rate limiting and balance checks
- Wallet verification

### 🏆 Profile & Badges
- Comprehensive user profiles
- Achievement badges (EFP, EFPas, transaction milestones)
- Public profile sharing

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT
- **SMS**: Twilio
- **External APIs**: EFP, EFPas, FX rates
- **Blockchain**: Base Sepolia integration

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   ```bash
   # Create PostgreSQL database
   createdb tapngo_db
   
   # Run migrations
   npm run migrate
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Vendors
- `POST /api/vendor/register` - Register as vendor
- `GET /api/vendor/profile` - Get vendor profile
- `PUT /api/vendor/profile` - Update vendor profile
- `GET /api/vendor/` - List vendors
- `GET /api/vendor/ens/:ensName` - Get vendor by ENS

### Profiles
- `GET /api/profile/:userId` - Get user profile with badges
- `PUT /api/profile/update` - Update profile
- `GET /api/profile/:userId/transactions` - Get user transactions
- `GET /api/profile/:userId/vendor` - Get vendor profile

### Transactions
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/order/:orderId` - Get transaction by order ID
- `PUT /api/transactions/:id/status` - Update transaction status
- `GET /api/transactions/user/:userId` - Get user transactions
- `GET /api/transactions/vendor/:vendorId` - Get vendor transactions
- `GET /api/transactions/stats/overview` - Get transaction statistics

### Faucet
- `POST /api/faucet/request` - Request bUSDC tokens
- `GET /api/faucet/status/:walletAddress` - Check faucet status
- `GET /api/faucet/info` - Get faucet information
- `GET /api/faucet/stats` - Get faucet statistics (admin)

## Environment Variables

See `env.example` for all required environment variables.

### Required Services

1. **PostgreSQL Database**
2. **Twilio Account** (for SMS)
3. **EFP API** (for verification)
4. **EFPas API** (for reputation scores)
5. **FX API** (for exchange rates)

## Database Schema

### Users Table
- Multi-provider authentication support
- Phone verification tracking
- Social login integration

### Vendors Table
- ENS name management
- EFP/EFPas verification status
- Business information
- Earnings tracking

### Transactions Table
- Order ID tracking
- Multi-currency support
- Status management
- Blockchain integration

### OTPs Table
- Phone verification codes
- Rate limiting and expiration
- Security tracking

## Security Features

- JWT authentication with refresh tokens
- Rate limiting on all endpoints
- Input validation with Joi
- SQL injection protection via Sequelize
- CORS configuration
- Helmet.js security headers
- Phone number hashing for privacy

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Run database migrations

### Code Structure
```
src/
├── config/          # Database and app configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Sequelize models
├── routes/          # API routes
├── services/        # External service integrations
└── utils/           # Utility functions
```

## Integration Points

### EFP (Ethereum Follow Protocol)
- Wallet verification
- Profile data fetching
- ENS name resolution

### EFPas (Reputation System)
- Score calculation
- Badge generation
- Level determination

### FX API
- Real-time exchange rates
- Currency conversion
- Rate caching

### Blockchain
- Transaction verification
- Balance checking
- Gas estimation

## Monitoring & Logging

- Morgan HTTP request logging
- Error tracking and reporting
- Performance monitoring
- Database query logging (development)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
