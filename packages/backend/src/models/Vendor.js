import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Vendor = sequelize.define('Vendor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ens_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z0-9-]+\.tapngo\.eth$/
    }
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  business_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  business_category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  business_website: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  business_logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  phone_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  efp_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  efpas_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 1000
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'suspended', 'rejected'),
    defaultValue: 'pending'
  },
  verification_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejected_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_earnings: {
    type: DataTypes.DECIMAL(20, 6),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_transactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    }
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'vendors',
  indexes: [
    {
      unique: true,
      fields: ['ens_name']
    },
    {
      unique: true,
      fields: ['phone_hash']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default Vendor;
