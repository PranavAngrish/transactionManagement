module.exports = {
  PORT: process.env.PORT || 3000,
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS) || 10,
  BASE_CURRENCY: process.env.BASE_CURRENCY || 'INR',
  EXCHANGE_API_URL:  process.env.EXCHANGE_API_URL || "https://open.er-api.com/v6/latest/INR",
  EXCHANGE_CACHE_DURATION: Number(process.env.EXCHANGE_CACHE_DURATION) || 60 * 60 * 1000 // 1 hour
};