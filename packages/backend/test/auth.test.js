import request from 'supertest';
import app from '../src/app.js';
import { User, OTP } from '../src/models/index.js';
import { SMSService } from '../src/services/smsService.js';
import bcrypt from 'bcryptjs';

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user with wallet address', async () => {
      const userData = {
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        first_name: 'John',
        last_name: 'Doe'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 1,
        ...userData,
        toJSON: () => ({ id: 1, ...userData })
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.requiresPhoneVerification).toBe(false);
    });

    it('should create a new user with email and password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 2,
        ...userData,
        toJSON: () => ({ id: 2, ...userData })
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.requiresPhoneVerification).toBe(false);
    });

    it('should create a new user with phone number', async () => {
      const userData = {
        phone: '+1234567890',
        first_name: 'Bob',
        last_name: 'Johnson'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 3,
        ...userData,
        toJSON: () => ({ id: 3, ...userData })
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.requiresPhoneVerification).toBe(true);
    });

    it('should return error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User already exists with this identifier');
    });

    it('should return validation error for invalid data', async () => {
      const userData = {
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with email and password', async () => {
      const loginData = {
        identifier: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        is_active: true,
        validatePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: 1, email: 'test@example.com' })
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(mockUser.validatePassword).toHaveBeenCalledWith('password123');
    });

    it('should login user with wallet address', async () => {
      const loginData = {
        identifier: '0x1234567890abcdef1234567890abcdef12345678'
      };

      const mockUser = {
        id: 1,
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
        is_active: true,
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ id: 1, wallet_address: '0x1234567890abcdef1234567890abcdef12345678' })
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        identifier: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        is_active: true,
        validatePassword: jest.fn().mockResolvedValue(false),
        toJSON: () => ({ id: 1, email: 'test@example.com' })
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should return error for inactive user', async () => {
      const loginData = {
        identifier: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        is_active: false,
        toJSON: () => ({ id: 1, email: 'test@example.com' })
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/send-otp', () => {
    it('should send OTP successfully', async () => {
      const otpData = {
        phone: '+1234567890',
        type: 'phone_verification'
      };

      SMSService.sendOTP.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        expiresIn: 300
      });

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send(otpData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Verification code sent successfully');
      expect(SMSService.sendOTP).toHaveBeenCalledWith('+1234567890', 'phone_verification');
    });

    it('should return error for invalid phone format', async () => {
      const otpData = {
        phone: '1234567890', // Missing + prefix
        type: 'phone_verification'
      };

      const response = await request(app)
        .post('/api/auth/send-otp')
        .send(otpData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid phone number format');
    });

    it('should return error when phone is missing', async () => {
      const response = await request(app)
        .post('/api/auth/send-otp')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Phone number is required');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify OTP successfully', async () => {
      const otpData = {
        phone: '+1234567890',
        code: '123456',
        type: 'phone_verification'
      };

      SMSService.verifyOTP.mockResolvedValue({
        success: true,
        message: 'OTP verified successfully'
      });

      const mockUser = {
        id: 1,
        phone: '+1234567890',
        update: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send(otpData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.verified).toBe(true);
      expect(mockUser.update).toHaveBeenCalledWith({ phone_verified: true });
    });

    it('should return error for invalid OTP', async () => {
      const otpData = {
        phone: '+1234567890',
        code: '000000',
        type: 'phone_verification'
      };

      SMSService.verifyOTP.mockResolvedValue({
        success: false,
        message: 'Invalid OTP code'
      });

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send(otpData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid OTP code');
    });

    it('should return validation error for invalid data', async () => {
      const otpData = {
        phone: '+1234567890',
        code: '123', // Too short
        type: 'invalid_type'
      };

      const response = await request(app)
        .post('/api/auth/verify-otp')
        .send(otpData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Validation error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        toJSON: () => ({ id: 1, email: 'test@example.com' })
      };

      User.findByPk.mockResolvedValue(mockUser);

      // Mock JWT verification by setting req.user
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });
  });
});
