import twilio from 'twilio';
import { OTP } from '../models/index.js';
import crypto from 'crypto';

// Initialize Twilio client only if credentials are provided
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC') ? 
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

export class SMSService {
  static async sendOTP(phone, type = 'phone_verification') {
    try {
      // Generate 6-digit OTP
      const code = crypto.randomInt(100000, 999999).toString();
      
      // Save OTP to database
      await OTP.create({
        phone,
        code,
        type,
        ip_address: null, // Will be set by controller
        user_agent: null  // Will be set by controller
      });

      // Check if Twilio is configured
      if (!client) {
        console.log(`📱 [DEV MODE] OTP for ${phone}: ${code}`);
        return {
          success: true,
          messageId: 'dev-mode',
          expiresIn: 600, // 10 minutes in seconds
          devMode: true
        };
      }

      // Send SMS via Twilio
      const message = await client.messages.create({
        body: `Your Tap&Go verification code is: ${code}. This code expires in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });

      console.log(`✅ OTP sent to ${phone}, SID: ${message.sid}`);
      
      return {
        success: true,
        messageId: message.sid,
        expiresIn: 600 // 10 minutes in seconds
      };
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      throw new Error('Failed to send verification code');
    }
  }

  static async verifyOTP(phone, code, type = 'phone_verification') {
    try {
      const otp = await OTP.findOne({
        where: {
          phone,
          code,
          type,
          is_used: false,
          expires_at: {
            [require('sequelize').Op.gt]: new Date()
          }
        },
        order: [['created_at', 'DESC']]
      });

      if (!otp) {
        // Increment attempts for the phone number
        await OTP.increment('attempts', {
          where: {
            phone,
            type,
            is_used: false
          }
        });
        
        return {
          success: false,
          message: 'Invalid or expired verification code'
        };
      }

      // Check if too many attempts
      if (otp.attempts >= 5) {
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new code.'
        };
      }

      // Mark OTP as used
      await otp.update({ is_used: true });

      return {
        success: true,
        message: 'Verification successful'
      };
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      throw new Error('Failed to verify code');
    }
  }

  static async cleanupExpiredOTPs() {
    try {
      const deletedCount = await OTP.destroy({
        where: {
          expires_at: {
            [require('sequelize').Op.lt]: new Date()
          }
        }
      });
      
      console.log(`🧹 Cleaned up ${deletedCount} expired OTPs`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up OTPs:', error);
    }
  }
}
