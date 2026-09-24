const crypto = require('crypto');
const https = require('https');
const PaymentSetting = require('../models/PaymentSetting');

/**
 * Get active Razorpay configuration from Database or Environment Variables
 */
const getRazorpayConfig = async () => {
  let setting = await PaymentSetting.findOne({ gateway: 'razorpay' });

  const apiKey = setting?.apiKey || process.env.RAZORPAY_KEY_ID || '';
  const apiSecret = setting?.apiSecret || process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = setting?.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const currency = setting?.currency || 'INR';
  const environment = setting?.environment || 'test';
  const status = setting?.status !== undefined ? setting.status : true;
  const methods = setting?.methods || { card: true, upi: true, upiQr: true, netbanking: true };

  return {
    apiKey,
    apiSecret,
    webhookSecret,
    currency,
    environment,
    status,
    methods
  };
};

/**
 * Make an authenticated API request to Razorpay REST API
 */
const razorpayApiRequest = async ({ method = 'GET', endpoint, data = null, apiKey, apiSecret }) => {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: `/v1${endpoint}`,
      method: method.toUpperCase(),
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.description || parsed.message || `Razorpay API Error (${res.statusCode})`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse Razorpay response: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

/**
 * Create Razorpay Order
 */
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {}, apiKey, apiSecret }) => {
  const payload = {
    amount: Math.round(amount * 100), // convert to paise
    currency: currency.toUpperCase(),
    receipt: receipt || `rcpt_${Date.now()}`,
    notes
  };

  return await razorpayApiRequest({
    method: 'POST',
    endpoint: '/orders',
    data: payload,
    apiKey,
    apiSecret
  });
};

/**
 * Process Razorpay Refund (Full or Partial)
 */
const refundRazorpayPayment = async ({ paymentId, amount, notes = {}, apiKey, apiSecret }) => {
  const payload = {};
  if (amount) {
    payload.amount = Math.round(amount * 100); // convert to paise for partial refund
  }
  if (notes) {
    payload.notes = notes;
  }

  return await razorpayApiRequest({
    method: 'POST',
    endpoint: `/payments/${paymentId}/refund`,
    data: payload,
    apiKey,
    apiSecret
  });
};

/**
 * Verify Razorpay Payment Signature (order_id | payment_id)
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature, apiSecret }) => {
  if (!orderId || !paymentId || !signature || !apiSecret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verify Razorpay Webhook Signature
 */
const verifyWebhookSignature = ({ body, signature, webhookSecret }) => {
  if (!body || !signature || !webhookSecret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(typeof body === 'string' ? body : JSON.stringify(body))
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  getRazorpayConfig,
  razorpayApiRequest,
  createRazorpayOrder,
  refundRazorpayPayment,
  verifyPaymentSignature,
  verifyWebhookSignature
};
