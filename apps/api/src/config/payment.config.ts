export const paymentConfig = () => ({
  provider: process.env.PAYMENT_PROVIDER || 'stripe',
  apiKey: process.env.PAYMENT_API_KEY || '',
});

export default paymentConfig;
