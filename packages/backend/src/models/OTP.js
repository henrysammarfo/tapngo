import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^\+[1-9]\d{1,14}$/
    }
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: {
      is: /^\d{6}$/
    }
  },
  type: {
    type: DataTypes.ENUM('phone_verification', 'password_reset', 'login'),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      max: 5
    }
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'otps',
  indexes: [
    {
      fields: ['phone', 'type']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['is_used']
    }
  ]
});

// Clean up expired OTPs
OTP.addHook('beforeCreate', (otp) => {
  // Set expiration to 10 minutes from now
  if (!otp.expires_at) {
    otp.expires_at = new Date(Date.now() + 10 * 60 * 1000);
  }
});

export default OTP;
