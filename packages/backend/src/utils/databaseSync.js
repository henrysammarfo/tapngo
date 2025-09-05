import { sequelize, User, Vendor, Transaction, OTP } from '../models/index.js';

export const syncDatabase = async () => {
  try {
    // Sync all models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized successfully');
    
    // Create indexes if they don't exist
    await createIndexes();
    
    return true;
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

const createIndexes = async () => {
  try {
    // Create additional indexes for better performance
    const queries = [
      // User indexes
      `CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;`,
      `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;`,
      
      // Vendor indexes
      `CREATE INDEX IF NOT EXISTS idx_vendors_ens_name ON vendors(ens_name);`,
      `CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);`,
      `CREATE INDEX IF NOT EXISTS idx_vendors_efp_verified ON vendors(efp_verified);`,
      
      // Transaction indexes
      `CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON transactions(vendor_id);`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_amount_usdc ON transactions(amount_usdc);`,
      
      // OTP indexes
      `CREATE INDEX IF NOT EXISTS idx_otps_phone_type ON otps(phone, type);`,
      `CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);`,
      `CREATE INDEX IF NOT EXISTS idx_otps_is_used ON otps(is_used);`
    ];

    for (const query of queries) {
      await sequelize.query(query);
    }
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    // Don't throw error for index creation failures
  }
};
