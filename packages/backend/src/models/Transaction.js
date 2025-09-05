import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.STRING(66),
    allowNull: false,
    unique: true
  },
  buyer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  vendor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'vendors',
      key: 'id'
    }
  },
  vendor_ens: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  amount_ghs: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  amount_usdc: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  fx_rate: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  platform_fee: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  vendor_amount: {
    type: DataTypes.DECIMAL(20, 6),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  payment_type: {
    type: DataTypes.ENUM('quick_pay', 'invoice_pay'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  failure_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tx_hash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    unique: true
  },
  block_number: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  gas_used: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  gas_price: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  indexes: [
    {
      unique: true,
      fields: ['order_id']
    },
    {
      unique: true,
      fields: ['tx_hash']
    },
    {
      fields: ['buyer_id']
    },
    {
      fields: ['vendor_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

export default Transaction;
