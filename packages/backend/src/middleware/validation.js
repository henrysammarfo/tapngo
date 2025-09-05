import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  // User registration
  userSignup: Joi.object({
    wallet_address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).optional(),
    password: Joi.string().min(8).when('email', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    social_provider: Joi.string().valid('google', 'facebook', 'twitter', 'github').optional(),
    social_id: Joi.string().when('social_provider', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    first_name: Joi.string().max(100).optional(),
    last_name: Joi.string().max(100).optional(),
    profile_picture: Joi.string().uri().optional()
  }).or('wallet_address', 'email', 'phone'),

  // User login
  userLogin: Joi.object({
    identifier: Joi.string().required(), // email, phone, or wallet
    password: Joi.string().when('identifier', {
      is: Joi.string().email(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // OTP verification
  otpVerification: Joi.object({
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
    code: Joi.string().pattern(/^\d{6}$/).required(),
    type: Joi.string().valid('phone_verification', 'password_reset', 'login').required()
  }),

  // Vendor registration
  vendorRegistration: Joi.object({
    ens_name: Joi.string().pattern(/^[a-z0-9-]+\.tapngo\.eth$/).required(),
    business_name: Joi.string().max(255).required(),
    business_description: Joi.string().max(1000).optional(),
    business_category: Joi.string().max(100).optional(),
    business_website: Joi.string().uri().optional(),
    business_logo: Joi.string().uri().optional(),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required()
  }),

  // Profile update
  profileUpdate: Joi.object({
    first_name: Joi.string().max(100).optional(),
    last_name: Joi.string().max(100).optional(),
    profile_picture: Joi.string().uri().optional(),
    business_name: Joi.string().max(255).optional(),
    business_description: Joi.string().max(1000).optional(),
    business_category: Joi.string().max(100).optional(),
    business_website: Joi.string().uri().optional(),
    business_logo: Joi.string().uri().optional()
  }),

  // Transaction creation
  transactionCreate: Joi.object({
    vendor_id: Joi.string().uuid().required(),
    amount_ghs: Joi.number().positive().required(),
    payment_type: Joi.string().valid('quick_pay', 'invoice_pay').required(),
    metadata: Joi.object().optional()
  }),

  // Faucet request
  faucetRequest: Joi.object({
    wallet_address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required()
  })
};
