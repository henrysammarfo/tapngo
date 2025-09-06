# TapNGo App - Quick Start Guide

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file in `packages/nextjs/` with your Clerk keys:

```bash
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aGFybWxlc3MtaGFtc3Rlci05OS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_XHtr91a3a23chmCUeQkEHOXzTCAm4WsBlmmP5dhTAA

# Optional: Backend API URL (defaults to localhost:3001)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Start the Application

#### Option A: Full Stack (Recommended)
```bash
# Terminal 1: Start local blockchain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start backend (optional)
cd packages/backend
yarn install
yarn start

# Terminal 4: Start frontend
yarn start
```

#### Option B: Frontend Only (Faster for testing)
```bash
# Start local blockchain
yarn chain

# Deploy contracts
yarn deploy

# Start frontend
yarn start
```

### 3. Access the App
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001 (if running)
- **Block Explorer**: http://localhost:3000/blockexplorer

## 🎯 Core Features Working

### ✅ Authentication
- Clerk authentication integrated
- Sign up/Sign in pages
- Protected routes working

### ✅ Payment Features
- **User Dashboard**: Main hub with all payment options
- **Send Money**: P2P transfers with QR/NFC support
- **Receive Money**: Generate payment requests
- **QR Scanner**: Scan payment QR codes
- **NFC Support**: Tap-to-pay functionality

### ✅ Web3 Integration
- Wallet connection (RainbowKit)
- Smart contract interactions
- USDC balance display
- Transaction history

### ✅ Performance Optimizations
- Video loading optimized (preload="metadata")
- API timeout handling (5s timeout)
- Bundle splitting for faster loads
- Non-blocking vendor status checks

## 🔧 Key Improvements Made

1. **Performance**: 
   - Reduced video preload from "auto" to "metadata"
   - Added API timeouts to prevent hanging
   - Optimized bundle splitting

2. **User Experience**:
   - Made payment options clickable
   - Fixed balance display consistency
   - Added proper loading states

3. **Error Handling**:
   - Backend failures don't block the app
   - Graceful fallbacks for missing data
   - Better error messages

## 🎮 Testing the App

1. **Sign Up/Sign In**: Use Clerk authentication
2. **Connect Wallet**: Link your Web3 wallet
3. **Get Demo Funds**: Use the faucet to get test USDC
4. **Make Payments**: Try sending/receiving money
5. **QR Codes**: Generate and scan payment QR codes

## 📱 Mobile Features

- Responsive design for mobile/tablet
- NFC support for tap-to-pay
- QR code generation and scanning
- Touch-friendly interface

## 🚨 Troubleshooting

### App loads slowly?
- The video background is now optimized
- Check your internet connection
- Try refreshing the page

### Backend errors?
- The app works with Clerk auth only
- Backend is optional for basic features
- Check console for specific errors

### Wallet not connecting?
- Make sure you're on the right network (Base Sepolia)
- Check if you have the right RPC URL
- Try refreshing the page

## 🎉 You're Ready!

Your TapNGo payment app is now fully functional with:
- Fast loading times
- Working authentication
- Complete payment features
- Web3 integration
- Mobile support

Start making payments! 🚀
