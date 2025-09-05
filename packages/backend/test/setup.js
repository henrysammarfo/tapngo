// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'tapngo_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock external services
jest.mock('../src/services/smsService.js', () => ({
  SMSService: {
    sendOTP: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-message-id',
      expiresIn: 300
    }),
    verifyOTP: jest.fn().mockResolvedValue({
      success: true,
      message: 'OTP verified successfully'
    })
  }
}));

jest.mock('../src/services/efpService.js', () => ({
  EFPService: {
    verifyEFP: jest.fn().mockResolvedValue({
      verified: true,
      score: 150
    })
  }
}));

jest.mock('../src/services/efpasService.js', () => ({
  EFPasService: {
    getEFPasScore: jest.fn().mockResolvedValue({
      data: { score: 150 }
    })
  }
}));

jest.mock('../src/services/fxService.js', () => ({
  FXService: {
    convertAmount: jest.fn().mockResolvedValue({
      data: {
        convertedAmount: 100,
        rate: 1.0
      }
    })
  }
}));

jest.mock('../src/services/blockchainService.js', () => ({
  BlockchainService: {
    initiatePayment: jest.fn().mockResolvedValue({
      success: true,
      txHash: '0x1234567890abcdef'
    })
  }
}));

// Mock database
jest.mock('../src/config/database.js', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
  }
}));

// Mock database models for isolated testing
jest.mock('../src/models/index.js', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Vendor: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Transaction: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Menu: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  OTP: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock authentication middleware
jest.mock('../src/middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    // Mock user for tests
    req.user = {
      id: 1,
      email: 'test@example.com',
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      role: 'user'
    };
    next();
  },
  requireVendor: (req, res, next) => {
    // Mock vendor for tests
    req.vendor = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: 1,
      ens_name: 'test.tapngo.eth',
      business_name: 'Test Business',
      status: 'active',
      update: jest.fn().mockResolvedValue(true)
    };
    next();
  },
  optionalAuth: (req, res, next) => {
    // Mock optional user for tests
    req.user = {
      id: 1,
      email: 'test@example.com',
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      role: 'user'
    };
    next();
  }
}));

// Mock database sync
jest.mock('../src/utils/databaseSync.js', () => ({
  syncDatabase: jest.fn().mockResolvedValue(true)
}));

// Global test timeout
jest.setTimeout(10000);
