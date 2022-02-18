export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || '1h',
  mailHost: process.env.MAIL_HOST,
  mailPort: process.env.MAIL_PORT || 587,
  mailUser: process.env.MAIL_USER,
  mailPass: process.env.MAIL_PASSWORD,
  mailSecure: process.env.MAIL_SECURE || false,
});
