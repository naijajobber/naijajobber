export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/naijajobber',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  mail: {
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'NaijaJobber <noreply@naijajobber.local>',
  },
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@naijajobber.local',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  apiPublicUrl: process.env.API_PUBLIC_URL || 'http://localhost:3001',
  payment: {
    mode: process.env.PAYMENT_MODE || 'mock',
    preferredProvider: process.env.PREFERRED_PAYMENT_PROVIDER || 'mock',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',
    flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  },
  ai: {
    mode: process.env.AI_MODE || 'mock',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    dailyLimit: parseInt(process.env.AI_DAILY_LIMIT || '20', 10),
    hourlyLimit: parseInt(process.env.AI_HOURLY_LIMIT || '10', 10),
  },
  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    googleCallbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3001/api/v1/auth/google/callback',
  },
});
