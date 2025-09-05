import { sequelize } from '../config/database.js';
import User from './User.js';
import Vendor from './Vendor.js';
import Transaction from './Transaction.js';
import OTP from './OTP.js';
import Menu from './Menu.js';

// Define associations
User.hasOne(Vendor, {
  foreignKey: 'user_id',
  as: 'vendorProfile'
});

Vendor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Transaction, {
  foreignKey: 'buyer_id',
  as: 'buyerTransactions'
});

Vendor.hasMany(Transaction, {
  foreignKey: 'vendor_id',
  as: 'vendorTransactions'
});

Transaction.belongsTo(User, {
  foreignKey: 'buyer_id',
  as: 'buyer'
});

Transaction.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor'
});

Vendor.hasMany(Menu, {
  foreignKey: 'vendor_id',
  as: 'menuItems'
});

Menu.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor'
});

export {
  sequelize,
  User,
  Vendor,
  Transaction,
  OTP,
  Menu
};
